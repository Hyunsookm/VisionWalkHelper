// utils/ble/connectToDevice.js
export const connectToDevice = async (device) => {
  try {
    const connectedDevice = await device.connect();
    console.log('✅ BLE 장치 연결 성공:', connectedDevice.id);

    await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log('🔎 서비스/특성 검색 완료');

    return connectedDevice;
  } catch (error) {
    console.error('❌ BLE 연결 실패:', error.message);
    return null;
  }
};