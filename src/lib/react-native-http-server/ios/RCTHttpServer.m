#import "RCTHttpServer.h"
#import "React/RCTBridge.h"
#import "React/RCTLog.h"
#import "React/RCTEventDispatcher.h"

#import "GCDWebServerPrivate.h"
#import "GCDWebServerDataRequest.h"
#import "GCDWebServerDataResponse.h"
#import "GCDWebServerFileResponse.h"
#import "GCDWebServerMultiPartFormRequest.h"
#include <stdlib.h>

static NSString *HTTP_SERVER_RESPONSE_RECEIVED = @"httpServerResponseReceived";
static RCTBridge *bridge;

@implementation RCTHttpServer

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[HTTP_SERVER_RESPONSE_RECEIVED];
}

- (NSDictionary *)constantsToExport
{
 return @{ @"HTTP_SERVER_RESPONSE_RECEIVED": HTTP_SERVER_RESPONSE_RECEIVED };
}

- (void)initResponseReceivedFor:(GCDWebServer *)server forType:(NSString*)type {
    [server addDefaultHandlerForMethod:type
                          requestClass:[GCDWebServerMultiPartFormRequest class]
                     asyncProcessBlock:^(GCDWebServerRequest* request, GCDWebServerCompletionBlock completionBlock) {
        
        long long milliseconds = (long long)([[NSDate date] timeIntervalSince1970] * 1000.0);
        int r = arc4random_uniform(1000000);
        NSString *requestId = [NSString stringWithFormat:@"%lld:%d", milliseconds, r];

         @synchronized (self) {
             [self->_completionBlocks setObject:completionBlock forKey:requestId];
         }

        @try {
            if ([GCDWebServerTruncateHeaderValue(request.contentType) isEqualToString:@"application/json"]) {
                GCDWebServerDataRequest* dataRequest = (GCDWebServerDataRequest*) request;
                [self sendEventWithName:HTTP_SERVER_RESPONSE_RECEIVED
                                                             body:@{@"requestId": requestId,
                                                                    @"body": dataRequest.jsonObject,
                                                                    @"type": type,
                                                                    @"query": request.query,
                                                                    @"url": request.URL.relativeString,
                                                                    @"headers": request.headers}];
            // 上传文件
            } else if ([GCDWebServerTruncateHeaderValue(request.contentType) hasPrefix:@"multipart/form-data"]) {
                GCDWebServerMultiPartFormRequest* fileRequest = (GCDWebServerMultiPartFormRequest*) request;
                [self sendEventWithName:HTTP_SERVER_RESPONSE_RECEIVED
                                                             body:@{@"requestId": requestId,
                                                                    @"file": @{
                                                                        @"fileName": fileRequest.files[0].fileName,
                                                                        @"mimeType": fileRequest.files[0].mimeType,
                                                                        @"path": fileRequest.files[0].temporaryPath
                                                                    },
                                                                    @"type": type,
                                                                    @"url": request.URL.relativeString,
                                                                    @"query": request.query,
                                                                    @"headers": request.headers}];
                
            } else {
                [self sendEventWithName:HTTP_SERVER_RESPONSE_RECEIVED
                                                             body:@{@"requestId": requestId,
                                                                    @"type": type,
                                                                    @"url": request.URL.relativeString,
                                                                    @"query": request.query,
                                                                    @"headers": request.headers}];
            }
        } @catch (NSException *exception) {
            [self sendEventWithName:HTTP_SERVER_RESPONSE_RECEIVED
                                                         body:@{@"requestId": requestId,
                                                                @"type": type,
                                                                @"url": request.URL.relativeString,
                                                                @"query": request.query,
                                                                @"headers": request.headers}];
        }
    }];
}

RCT_EXPORT_METHOD(start:(NSInteger) port
                  serviceName:(NSString *) serviceName
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject)
{
    RCTLogInfo(@"Running HTTP bridge server: %ld", port);
 //   NSMutableDictionary *_requestResponses = [[NSMutableDictionary alloc] init];
    _completionBlocks = [[NSMutableDictionary alloc] init];

    dispatch_sync(dispatch_get_main_queue(), ^{
        @try {
            _webServer = [[GCDWebServer alloc] init];
            
            [self initResponseReceivedFor:_webServer forType:@"POST"];
            [self initResponseReceivedFor:_webServer forType:@"PUT"];
            [self initResponseReceivedFor:_webServer forType:@"GET"];
            [self initResponseReceivedFor:_webServer forType:@"DELETE"];
            [self initResponseReceivedFor:_webServer forType:@"OPTIONS"];

            [_webServer startWithPort:port bonjourName:serviceName];
            resolve(serviceName);
        } @catch (NSException *exception) {
            reject(exception.name, exception.description, nil);
        }

    });
}

RCT_EXPORT_METHOD(stop)
{
    RCTLogInfo(@"Stopping HTTP bridge server");

    if (_webServer != nil) {
        [_webServer stop];
        [_webServer removeAllHandlers];
        _webServer = nil;
    }
}

RCT_EXPORT_METHOD(respond: (NSString *) requestId
                  code: (NSInteger) code
                  type: (NSString *) type
                  body: (NSString *) body)
{
    NSData* data = [body dataUsingEncoding:NSUTF8StringEncoding];
    GCDWebServerDataResponse* response = [[GCDWebServerDataResponse alloc] initWithData:data contentType:type];
    response.statusCode = code;
    if ([type isEqualToString:@"POST"] || [type isEqualToString:@"PUT"] || [type isEqualToString:@"DELETE"]){
        [response setValue:@"*" forAdditionalHeader:(@"Access-Control-Allow-Origin")];
        [response setValue:@"*" forAdditionalHeader:(@"Access-Control-Allow-Headers")];
        [response setValue:@"*" forAdditionalHeader:(@"Access-Control-Allow-Methods")];
    }
    response.gzipContentEncodingEnabled = NO;

    GCDWebServerCompletionBlock completionBlock = nil;
    @synchronized (self) {
        completionBlock = [_completionBlocks objectForKey:requestId];
        [_completionBlocks removeObjectForKey:requestId];
    }

    completionBlock(response);
}

RCT_EXPORT_METHOD(responseFile: (NSString *) requestId
                  path: (NSString *) path)
{
    GCDWebServerFileResponse* response = [[GCDWebServerFileResponse alloc] initWithFile:path];
    
    if ([response.contentType isEqualToString:@"text"]) {
        response.gzipContentEncodingEnabled = YES;
    } else {
        response.gzipContentEncodingEnabled = NO;
    }

    GCDWebServerCompletionBlock completionBlock = nil;
    @synchronized (self) {
        completionBlock = [_completionBlocks objectForKey:requestId];
        [_completionBlocks removeObjectForKey:requestId];
    }

    completionBlock(response);
}

@end
