// ============================================================
// 1. utils/ble/startDeviceScanAndConnect.js (수정)
// ============================================================

import { Alert } from 'react-native';
import bleManager from './bleManager';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_UUID = '87654321-1234-5678-1234-56789abcdef0';
const CHARACTERISTIC_UUID = 'fedcba01-1234-5678-1234-56789abcdef0';

/**
 * 시리얼 번호를 사용하여 BLE 디바이스 스캔 및 연결
 * @param {string} serialNumber - 사용자가 입력한 시리얼 번호
 * @param {Function} onDeviceConnected - 연결 성공 시 콜백
 * @param {Function} onError - 오류 발생 시 콜백
 */
export const startDeviceScanAndConnect = (serialNumber, onDeviceConnected, onError) => {
  let timeoutId = null;
  let deviceFound = false;

  // 시리얼 번호를 Base64로 변환 (라즈베리파이로 전송할 데이터)
  const WRITE_DATA = Buffer.from(serialNumber).toString('base64');

  bleManager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      bleManager.stopDeviceScan();
      clearTimeout(timeoutId);
      onError?.('스캔 실패: ' + error.message);
      return;
    }

    // VisionWalkHelper 기기만 필터링
    if (
      !deviceFound &&
      (device?.name?.includes('VisionWalkHelper') ||
        device?.localName?.includes('VisionWalkHelper'))
    ) {
      deviceFound = true;
      bleManager.stopDeviceScan();
      clearTimeout(timeoutId);

      try {
        console.log('📡 BLE 기기 발견:', device.id);

        // 기기 연결
        const isConnected = await device.isConnected();
        const connectedDevice = isConnected ? device : await device.connect();

        // 서비스 탐색
        await connectedDevice.discoverAllServicesAndCharacteristics();
        console.log('✅ 서비스 탐색 완료');

        // 연결 해제 모니터링 설정
        let authFailed = false;
        const disconnectSubscription = connectedDevice.onDisconnected((error, disconnectedDevice) => {
          console.log('🔌 기기 연결 해제됨:', disconnectedDevice?.id);
          if (!authFailed) {
            authFailed = true;
            onError?.('시리얼 번호가 일치하지 않습니다. 라즈베리파이가 연결을 거부했습니다.');
          }
        });

        // 시리얼 번호를 라즈베리파이로 전송
        console.log('🔐 시리얼 번호 전송 중...');
        await connectedDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          WRITE_DATA
        );

        // 라즈베리파이가 검증 중 (1~2초 대기)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 여전히 연결되어 있으면 인증 성공
        const stillConnected = await connectedDevice.isConnected();
        
        if (stillConnected) {
          // 인증 성공 - 연결 정보 저장
          disconnectSubscription?.remove?.();
          await AsyncStorage.setItem('lastConnectedDeviceId', connectedDevice.id);
          await AsyncStorage.setItem('deviceSerialNumber', serialNumber);
          console.log('✅ 인증 성공 및 연결 정보 저장');

          onDeviceConnected(connectedDevice);
        } else {
          // 이미 연결이 끊어진 경우 (라즈베리파이가 거부함)
          disconnectSubscription?.remove?.();
          if (!authFailed) {
            onError?.('시리얼 번호가 일치하지 않습니다.');
          }
        }
      } catch (connectErr) {
        console.error('❌ 연결 실패:', connectErr);
        onError?.('연결 실패: ' + connectErr.message);
      }
    }
  });

  // 10초 타임아웃
  timeoutId = setTimeout(() => {
    if (!deviceFound) {
      bleManager.stopDeviceScan();
      onError?.('10초 내에 BLE 기기를 찾지 못했습니다.');
    }
  }, 10000);
};

/**
 * 저장된 시리얼 번호로 자동 재연결
 */
export const reconnectWithSavedSerial = async (onDeviceConnected, onError) => {
  try {
    const savedDeviceId = await AsyncStorage.getItem('lastConnectedDeviceId');
    const savedSerial = await AsyncStorage.getItem('deviceSerialNumber');

    if (!savedDeviceId || !savedSerial) {
      onError?.('저장된 연결 정보가 없습니다.');
      return;
    }

    console.log('🔄 저장된 기기로 재연결 시도:', savedDeviceId);

    const device = await bleManager.connectToDevice(savedDeviceId);
    await device.discoverAllServicesAndCharacteristics();

    // 연결 해제 모니터링
    let authFailed = false;
    const disconnectSubscription = device.onDisconnected((error, disconnectedDevice) => {
      console.log('🔌 재연결 중 기기 연결 해제됨');
      if (!authFailed) {
        authFailed = true;
        onError?.('저장된 시리얼 번호 인증 실패');
      }
    });

    // 저장된 시리얼 번호로 재인증
    const WRITE_DATA = Buffer.from(savedSerial).toString('base64');
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      WRITE_DATA
    );

    // 라즈베리파이 검증 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const stillConnected = await device.isConnected();

    if (stillConnected) {
      disconnectSubscription?.remove?.();
      console.log('✅ 자동 재연결 성공');
      onDeviceConnected(device);
    } else {
      disconnectSubscription?.remove?.();
      throw new Error('저장된 시리얼 번호 인증 실패');
    }
  } catch (err) {
    console.warn('❌ 자동 재연결 실패:', err.message);
    onError?.(err.message);
  }
};
