//
//  RNQuickLookView.h
//  PrivateSpace
//
//  Created by 罗绪海 on 2022/4/3.
//

#import <UIKit/UIKit.h>
#import <QuickLook/QuickLook.h>
#import <React/RCTComponent.h>

@interface RNQuickLookView : UIView<QLPreviewControllerDataSource, QLPreviewControllerDelegate> {
    NSString* _url;
    NSString* _assetFileName;
}

@property UIView* previewView;
@property QLPreviewController* previewCtrl;

- (instancetype)initWithPreviewItemUrl:(NSString*)url;

@end
