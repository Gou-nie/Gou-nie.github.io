<h1>UQDK-Ble</h1> 
<h2>UQDK蓝牙私有协议代码解析</h2>

*本项目是对CoreBluetooth的封装和一些私有实现，采用由使用到细节的方式记录*
*[关于CoreBluetooth相关文档](https://developer.apple.com/documentation/corebluetooth)*

* 1. [连接](#first)
   * 1.1. [使用方法](#firstPOne)
   * 1.2. [初始化](#firstPTwo)
   * 1.3. [扫描&连接](#firstPThree)
* 2. [指令发送](#second)
   * 2.1. [数据报文](#secondPOne)

## 1.  <a name='first'></a> 连接
### 1.1. <a name='firstPOne'></a> 使用方法
<br> &emsp;&emsp;在引入UQDKBleManager头文件后，使用UQDKBleManager的静态方法createBLEWithMac:bleMac 来创建初始化UQDKBleManager对象，然后调用connectToVehicle: 方法进行连接并处理错误回掉。如下代码所示：
```objective-c
#import "UQDKBleManager.h"
@property (nonatomic, strong) UQDKBleManager *bleManager;
@property(nonatomic, copy) UQDKBleOnDeviceStatusChangedBlock deviceStatusChangedBlock;
...
self.bleManager = [UQDKBleManager createBLEWithMac:macAdress];
self.bleManager.deviceStatusChangedBlock = deviceStatusChangedBlock;
...
[self.bleManager connectToVehicle:^(NSError * _Nullable error) {
        <#code#>
}];
```


### 1.2. <a name='firstPTwo'></a> 初始化

<br> &emsp;&emsp;在UQDK初始化的时候，会根据传入的mac地址来初始化创建UQDKBleAdapter单例。同时在UQDKBleManager中的datahelper来管理一些私密数据，并且以kUQDKBLE_API_QUEUE和kUQDKBLE_COMMAND_QUEUE为key创建了两个队列。apiqueue做业务激活和认证时的异步线程，commandQueue做蓝牙连接成功之后车控指令发送的异步线程。

代码如下：
```objective-c 
UQDKBleManager.m
- (instancetype)initWithMac:(NSString *)mac {
    self = [super init];
    if (self) {
        _bleAdapter = [[UQDKBleAdapter alloc] initWithMac:mac];
        _dataHelper = [UQDKDataManager sharedInstance];
        _authCounter = 0;
        _isConnecting = NO;
        __weak typeof(self) weakSelf = self;
        _bleAdapter.onDeviceStatusChanged = ^(UQDKBleDeviceStatus status) {
            [weakSelf handleDeviceStatusChanged:status];
        };
        
        self.commandData = [NSMutableDictionary dictionary];
        
        self.apiQueue = dispatch_queue_create(kUQDKBLE_API_QUEUE, DISPATCH_QUEUE_SERIAL);
        self.commandQueue = dispatch_queue_create(kUQDKBLE_COMMAND_QUEUE, DISPATCH_QUEUE_CONCURRENT);
        
        [self updateVehicleStatus:UQDKVehicleDisconnected];
    }
    return self;
}
```


<br>&emsp;&emsp;在单例UQDKBleAdapter中来管理蓝牙连接和数据发送。

***中心设备管理器(CentralManager)***
<br> &emsp;&emsp;Corebluetooth中，是中心设备扫描到外围设备后，会根据外围设备的广播数据中的UUID来建立连接的。UQDK-Ble中有一个UQDKCentralManager来管理中心设备的连接。在UQDKBleAdapter的initWithMac方法中，可以做一些初始化的设置，比如设置UUID扫描过滤规则，设置连接参数等。 对于中心设备的初始化这里都可以参照[CoreBluetooth-CentralManager文档](https://developer.apple.com/documentation/corebluetooth/cbcentralmanager?language=objc)来根据实际情况修改。
<br> 

***队列***
<br> &emsp;&emsp;使用到了三个队列，分别是写队列，消息接受队列和回掉队列。
```objective-c
_writingQueue = [NSMutableDictionary<NSNumber *, UQDKBleQueueData *> dictionary];
_receivingQueue = [NSMutableDictionary<NSNumber *, UQDKBleNotifyQueueData *> dictionary];
_callbackQueue = [UQDKQueue getQueue];
```

***其他参数***
macAddress: 外围设备的mac地址
currentDeviceStatus: 外围设备的连接状态
notificationRetryTimes: 通知重试次数
peripheralManager: 外围设备管理器   
```objective-c
_macAdress = mac;
_currentDeviceStatus = UQDKBleDeviceStatusDisconnected;
_notificationRetryTimes = kUQDKBleNotificationRetryTimes;
_peripheralManager = [UQDKPeripheralManager manager];
```

### 1.3. <a name='firstPThree'></a> 扫描&连接
<br> &emsp;&emsp;在UQDKBleManager的connectToBLE方法中，在apiQueue中调用BleAdapter的connect方法来扫描连接外围设备，继续来看一看BleAdapter的connect方法。

```objective-c 

UQDKBleAdapter.m
// Connect with vin and callback
- (void)connect:(UQDKBleOnConnectProcessBlock)connectCallback {
    UQDKLogN(@"start connect ble");
    self.connectCallback = connectCallback;
    self.action = UQDKBleAdapterActionConnect;
    self.isActiveConnect = YES;
    // Check connected peripherals to detect
    //      if the peripheral is already connected by another program
    
    __weak typeof(self) weakSelf = self;
    [self.centralManager stateDidUpdate:^(UQDKCentralManager * _Nonnull centralManager) {
        if (centralManager.state != UQDKBluetoothManagerStatePoweredOn) {
            [weakSelf centralManagerStateNotPoweredOn];
        }
        else {
            if ([weakSelf peripheralAvailable] && weakSelf.isActiveConnect) {
                [weakSelf startConnecting];
            }
        }
    }];
}
// Start scanning
- (void)startScanning {
    __weak typeof(self) weakSelf = self;
    [self.centralManager startScanning:^(UQDKCentralManager * _Nonnull centralManager,
                                         UQDKPeripheral * _Nonnull peripheral) {
        [weakSelf handleDiscoverPeripheral:peripheral];
    } timeoutCallback:^(UQDKCentralManager * _Nonnull centralManager, NSError * _Nullable error) {
        // Scanning timeout callback with timeout error
        [weakSelf handleScanningTimeout:error];
    }];
}
// Handle discover peripherals
- (void)handleDiscoverPeripheral:(UQDKPeripheral *)peripheral {
    if ([peripheral matches:self.macAdress]) {
        // Why do not stop scanning here
        // Because if the peripheral still advertising, a new pair code will be generated
        // [self.centralManager stopScanning];
        [self.centralManager stopScanning];
        // Connect peripheral
        [self connectPeripheral:peripheral];
    }
}



UQDKCentralManager.m
- (void)startScanningForPeripheralsWithServices:(NSArray<UQDKUUID *> *)serviceUUIDs
                               discoverCallback:(UQDKCentralManagerDiscoverPeripheralCallback)
                                                                        discoverPeripheralCallback
                                timeoutCallback:(UQDKCentralManagerErrorCallback)timeoutCallback {
    self.serviceUUIDs = serviceUUIDs;
    if (!self.isScanning) {
        self.isScanning = YES;
        
        // Clear all discovered peripherals
        [self.configuredDiscoveredPeripherals removeAllObjects];
        [self.configuredConnectedPeripherals removeAllObjects];
        
        self.discoverPeripheralCallback = discoverPeripheralCallback;
        self.timeoutCallback = timeoutCallback;
        
        if (self.state == UQDKBluetoothManagerStatePoweredOn) {
            [self startScan:serviceUUIDs];
        }
        else {
            // Will start scan after power on
//            self.isWaitingScanning = YES;
        }
    }
}
- (void)startScan:(nullable NSArray<UQDKUUID *> *)serviceUUIDs {
    NSArray<UQDKUUID *> *UUIDs = serviceUUIDs ?: self.options.serviceUUIDs;
    
    [self.cbCentralManager scanForPeripheralsWithServices:[UQDKUUID cbUUIDs:UUIDs]
                                                  options:self.options.scanOptions];
    // Timeout check
    if (self.options.scanTimeoutInterval > 0) {
        __weak typeof(self) weakSelf = self;
        self.delayCallback = dispatch_block_create(0, ^{
            [weakSelf handleScanTimeout];
        });
        [self delayCallback:self.options.scanTimeoutInterval withBlock:self.delayCallback];
    }
}

```
<br> &emsp;&emsp;在connect方法中，首先会判断蓝牙是否开启，如果没有开启则调用centralManagerStateNotPoweredOn方法，然后判断外围设备是否可用，如果可用则调用startConnecting方法.走到UQDKCentralManager的startScan方法中，开始扫描外围设备。在扫描到外围设备后，会调用handleDiscoverPeripheral方法来处理外围设备。在handleDiscoverPeripheral方法中，会判断外围设备的mac地址是否匹配，如果匹配则停止扫描，然后调用connectPeripheral方法来连接外围设备。最后走到Corebluetooth包的[CBCentralManager scanForPeripheralsWithServices: options:]方法中，这里放入serviceUUID和一些配置参数才开始调取设备扫描。
<br> &emsp;&emsp;在UQDKCentralManager中有响应CBCentralManagerDelegate的代理方法，在代理方法中，会根据不同的状态来处理外围设备的连接。这里扫描的时候是会回掉到一个代理方法中在这里我们实现自己的过滤逻辑来管理判断这个外设是不是我们需要连接的外设。
**

```objective-c
@interface UQDKCentralManager (CentralManagerDelegate) <CBCentralManagerDelegate>
/**
 *  @method centralManager:didDiscoverPeripheral:advertisementData:RSSI:
 *
 *  Did discover peripheral callback
 *  This method is invoked after you call CBCentralManager's scanForPeripheralsWithServices
 */
- (void)centralManager:(CBCentralManager *)central
            didDiscoverPeripheral:(CBPeripheral *)peripheral
                advertisementData:(NSDictionary<NSString *,id> *)advertisementData
                             RSSI:(NSNumber *)RSSI {
    [self didDiscoverPeripheral:peripheral advertisementData:advertisementData RSSI:RSSI];
}

- (void)didDiscoverPeripheral:(CBPeripheral *)peripheral
            advertisementData:(NSDictionary<NSString *,id> *)advertisementData
                         RSSI:(NSNumber *)RSSI {
    NSLog(@"scan a peripheral uuid is : %@",peripheral.identifier.UUIDString);
    UQDKPeripheral *dkPeripheral =
        [self.configuredDiscoveredPeripherals objectForKey:peripheral.identifier.UUIDString];
    if (!dkPeripheral) {
        dkPeripheral = [[UQDKPeripheral alloc] initWithPeripheral:peripheral
                                                advertisementData:advertisementData
                                                             RSSI:RSSI
                                                   centralManager:self];
        
        NSLog(@"add a peripheral uuid is : %@",peripheral.identifier.UUIDString);
        [self addPeripheral:dkPeripheral to:self.configuredDiscoveredPeripherals];
    }
    else {
        [dkPeripheral didReceiveAdvertising:advertisementData RSSI:RSSI];
    }
    
    // Peripheral callback
    [self discoverPeripheralCallback:dkPeripheral];
}

```
