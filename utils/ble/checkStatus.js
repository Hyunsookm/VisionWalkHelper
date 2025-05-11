import bleManager from './bleManager';

export const checkBLEStatus = async () => {
  const state = await bleManager.state();
  if (state !== 'PoweredOn') {
    console.warn('Bluetooth 꺼져 있음');
    Alert.alert('Bluetooth 꺼짐', 'BLE 기능을 사용하려면 Bluetooth를 켜주세요.');
  } else {
    console.log('BLE 사용 가능');
  }
};
