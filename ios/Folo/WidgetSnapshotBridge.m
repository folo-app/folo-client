#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetSnapshotBridge, NSObject)

RCT_EXTERN_METHOD(saveGrowthSnapshot:(NSString *)snapshotJson
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearGrowthSnapshot:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
