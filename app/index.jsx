import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getAuthInstance, onAuthStateChanged } from '../firebase/firebaseConfig'; // ✅ 인증 상태 확인
import { checkBLEStatus } from '../utils/ble/checkStatus';
import { startDeviceScanAndConnect } from '../utils/ble/startDeviceScanAndConnect';

export default function HomeScreen() {
  const [uid, setUid] = useState(null);
  const [bleDevice, setBleDevice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  // ✅ Firebase 인증 감지
  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log('✅ 로그인된 UID:', user.uid);
      } else {
        setUid(null);
        console.log('❌ 로그아웃 상태');
      }
    });
    return unsubscribe;
  }, []);

  const requestBLEPermissions = async () => {
    if (Platform.OS === 'android') {
      const sdkInt = parseInt(Platform.Version, 10);
      const permissions =
        sdkInt >= 31
          ? [
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]
          : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      const result = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = Object.values(result).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        throw new Error('필수 BLE 권한이 거부되었습니다.');
      }
    }
  };

  useEffect(() => {
    const initBLE = async () => {
      try {
        await requestBLEPermissions();
        await checkBLEStatus();
      } catch (err) {
        Alert.alert('BLE 오류', err.message);
      }
    };
    initBLE();
  }, []);

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);

    startDeviceScanAndConnect((connectedDevice) => {
      setBleDevice(connectedDevice);
      Alert.alert('연결 성공', `장치: ${connectedDevice.name || '알 수 없음'}`);
      setScanning(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 홈 화면</Text>
      {uid && <Text>UID: {uid}</Text>}

      {/* 로그인 안 된 경우 → 카카오 로그인 화면으로 이동 */}
      {!uid && (
        <Button
          title="카카오 로그인 페이지로 이동"
          color="#FEE500"
          onPress={() => router.push('/login/LoginScreen')}
        />
      )}

      {/* 로그인된 경우에만 BLE 버튼 표시 */}
      {uid && (
        <>
          <Button
            title={scanning ? '스캔 중…' : 'BLE 장치 스캔'}
            onPress={handleScan}
            disabled={scanning}
          />

          {bleDevice && (
            <Text style={{ marginTop: 20 }}>
              🔗 연결된 장치: {bleDevice.name || '알 수 없음'}
            </Text>
          )}
        </>
      )}

      <Button
        title="프로필로 이동"
        onPress={() => router.push('/profile')}
        color="blue"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 10 },
  link: { color: 'blue', marginTop: 20 },
});
