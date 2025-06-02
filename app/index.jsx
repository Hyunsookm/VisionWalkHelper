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

  const router = useRouter(); // ✅ useRouter 훅 추가

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
    // 로그인 유지 감지
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    // BLE 초기화
    const initBLE = async () => {
      try {
        await requestBLEPermissions();
        await checkBLEStatus();
      } catch (err) {
        Alert.alert('BLE 오류', err.message);
      }
    };

    initBLE();

    return () => unsubscribe();
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

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      Alert.alert('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('로그아웃 실패', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 홈 화면</Text>
      {uid && <Text>UID: {uid}</Text>}

      {!uid && (
        <Button
          title="카카오 로그인 페이지로 이동"
          color="#FEE500"
          onPress={() => router.push('/login/LoginScreen')}
        />
      )}

      {uid && (
        <>
          <Button
            title={scanning ? '스캔 중…' : 'BLE 장치 스캔'}
            onPress={handleScan}
            disabled={scanning}
          />
          <Button
            title="로그아웃"
            onPress={handleLogout}
            color="#ff4d4d"
          />
        </>
      )}

      {bleDevice && (
        <Text style={{ marginTop: 20 }}>
          🔗 연결된 장치: {bleDevice.name || '알 수 없음'}
        </Text>
      )}

      <Button
        title="프로필로 이동"
        onPress={() => router.push('/profile')}
        color="blue"
      />
      <Link href="/profile">
        <Text style={styles.link}>프로필로 이동</Text>
      </Link>
      <Link href="/map">
        <Text style={styles.link}>🗺️ 지도 화면으로 이동</Text>
      </Link>

      {/* ✅ 역할 선택 버튼 추가 */}
      <Text style={{ marginTop: 30, fontSize: 16 }}>회원가입 유형 선택</Text>

      <View style={styles.buttonRow}>
        <Button
          title="사용자로 가입"
          onPress={() => router.push('/signup/user')}
        />
        <Button
          title="보호자로 가입"
          onPress={() => router.push('/signup/guardian')}
        />
      </View>

      <Link href="/login">
        <Text style={styles.link}>로그인 화면으로 이동</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 10 },
  link: { color: 'blue', marginTop: 20 },
});
