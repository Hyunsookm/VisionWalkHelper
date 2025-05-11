// utils/ble/startDeviceScanAndConnect.js
import { Alert } from 'react-native';
import bleManager from './bleManager';

export const startDeviceScanAndConnect = (onDeviceConnected) => {
  let timeoutId = null;

  bleManager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      console.error('❌ BLE 스캔 오류:', error);
      Alert.alert('스캔 실패', error.message);
      return;
    }

    console.log('🔍 탐지:', device?.name, device?.localName, device?.id);

    if (
      device?.name?.includes('TestBLE') ||
      device?.localName?.includes('TestBLE')
    ) {
      console.log('🎯 대상 장치 발견:', device.name || device.localName);
      bleManager.stopDeviceScan();
      clearTimeout(timeoutId);

      try {
        const isConnected = await device.isConnected();
        if (!isConnected) {
          const connectedDevice = await device.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          console.log('✅ 연결 성공:', connectedDevice.id);
          onDeviceConnected(connectedDevice);
        } else {
          console.log('⚠️ 이미 연결된 장치');
          onDeviceConnected(device);
        }
      } catch (connectErr) {
        console.error('❌ 연결 실패:', connectErr.message);
        Alert.alert('연결 실패', connectErr.message);
      }
    }
  });

  timeoutId = setTimeout(() => {
    bleManager.stopDeviceScan();
    console.warn('⏰ 스캔 타임아웃');
    Alert.alert('스캔 실패', '10초 내에 BLE 장치를 찾지 못했습니다.');
  }, 10000);
};
