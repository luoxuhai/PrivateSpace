//
//  RNQuickLookManager.m
//  PrivateSpace
//
//  Created by 罗绪海 on 2022/4/3.
//

#import "RNQuickLookManager.h"
#import "RNQuickLookView.h"
#import <QuickLook/QuickLook.h>

@implementation RNQuickLookManager

RCT_EXPORT_MODULE(RNQuickLookView)

RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(assetFileName, NSString)

- (UIView *) view  {
    return [[RNQuickLookView alloc] init];
}

@end
