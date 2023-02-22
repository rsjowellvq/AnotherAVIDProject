#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "BLECommandContext.h"
#import "BleManager.h"
#import "CBPeripheral+Extensions.h"
#import "NSData+Conversion.h"

FOUNDATION_EXPORT double react_native_ble_managerVersionNumber;
FOUNDATION_EXPORT const unsigned char react_native_ble_managerVersionString[];

