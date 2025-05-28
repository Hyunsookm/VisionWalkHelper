import { Link } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';
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
import { getAuthInstance } from '../firebase/firebaseConfig';

import { checkBLEStatus } from '../utils/ble/checkStatus';
import { startDeviceScanAndConnect } from '../utils/ble/startDeviceScanAndConnect';
export default function HomeScreen() {
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bleDevice, setBleDevice] = useState(null);
  const [scanning, setScanning] = useState(false);

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

  const handleLogin = async () => {
    try {
      setLoading(true);
      const auth = getAuthInstance();
      const { user } = await signInAnonymously(auth);
      setUid(user.uid);
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

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

      {!uid && (
        <Button
          title={loading ? '로그인 중…' : '익명 로그인'}
          onPress={handleLogin}
          disabled={loading}
        />
      )}

      {uid && (
        <Button
          title={scanning ? '스캔 중…' : 'BLE 장치 스캔'}
          onPress={handleScan}
          disabled={scanning}
        />
      )}

      {bleDevice && (
        <Text style={{ marginTop: 20 }}>
          🔗 연결된 장치: {bleDevice.name || '알 수 없음'}
        </Text>
      )}

      <Link href="/profile">
        <Text style={styles.link}>프로필로 이동</Text>
      </Link>
      <Link href="/map">
        <Text style={styles.link}>🗺️ 지도 화면으로 이동</Text>
      </Link>
        <Link href="/settings">
            <Text style={styles.link}>로그인 화면으로 이동</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 10 },
  link: { color: 'blue', marginTop: 20 },
});
