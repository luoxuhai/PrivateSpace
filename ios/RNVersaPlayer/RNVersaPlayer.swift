import React

@objc(RNVersaPlayer)
class RNVersaPlayer: NSObject {
  var player: VersaPlayer!
  var controls: VersaPlayerControls!

    @objc(open:resolver:rejecter:)
    func open(options: NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    }
}
