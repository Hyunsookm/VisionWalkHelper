// utils/ble/startDeviceScanAndConnect.js

import { Alert } from 'react-native';
import bleManager from './bleManager';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_UUID = '87654321-1234-5678-1234-56789abcdef0';
const CHARACTERISTIC_UUID = 'fedcba01-1234-5678-1234-56789abcdef0';
const WRITE_DATA = Buffer.from('mysecret').toString('base64');

export const startDeviceScanAndConnect = (onDeviceConnected) => {
  let timeoutId = null;

  bleManager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      Alert.alert('스캔 실패', error.message);
      return;
    }

    if (
      device?.name?.includes('VisionWalkHelper') ||
      device?.localName?.includes('VisionWalkHelper')
    ) {
      bleManager.stopDeviceScan();
      clearTimeout(timeoutId);

      try {
        const isConnected = await device.isConnected();
        const connectedDevice = isConnected ? device : await device.connect();

        await connectedDevice.discoverAllServicesAndCharacteristics();
        console.log('✅ 연결 및 서비스 탐색 완료:', connectedDevice.id);

        // 설정용 쓰기 요청
        await connectedDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          WRITE_DATA
        );

        // 연결 정보 저장
        await AsyncStorage.setItem('lastConnectedDeviceId', connectedDevice.id);
        console.log('📦 연결된 기기 ID 저장됨:', connectedDevice.id);

        // 연결 완료 콜백
        onDeviceConnected(connectedDevice);
      } catch (connectErr) {
        Alert.alert('연결 실패', connectErr.message);
      }
    }
  });

  timeoutId = setTimeout(() => {
    bleManager.stopDeviceScan();
    Alert.alert('스캔 실패', '10초 내에 BLE 장치를 찾지 못했습니다.');
  }, 10000);
};
