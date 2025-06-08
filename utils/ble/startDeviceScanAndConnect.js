import { Alert } from 'react-native';
import bleManager from './bleManager';
import { Buffer } from 'buffer';

const SERVICE_UUID = '87654321-1234-5678-1234-56789abcdef0'; // 실제 UUID로 교체
const CHARACTERISTIC_UUID = 'fedcba01-1234-5678-1234-56789abcdef0'; // 실제 UUID로 교체
const WRITE_DATA = Buffer.from('mysecret').toString('base64'); // 'SGVsbG8='

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
      device?.name?.includes('VisionWalkHelper') ||
      device?.localName?.includes('VisionWalkHelper')
    ) {
      console.log('🎯 대상 장치 발견:', device.name || device.localName);
      bleManager.stopDeviceScan();
      clearTimeout(timeoutId);

      try {
        const isConnected = await device.isConnected();
        const connectedDevice = isConnected ? device : await device.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();
        console.log('✅ 연결 성공:', connectedDevice.id);

        // 🔽 Write 요청
        await connectedDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          WRITE_DATA
        );
        console.log('✍️ Write 요청 성공:', WRITE_DATA);

        onDeviceConnected(connectedDevice);
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
