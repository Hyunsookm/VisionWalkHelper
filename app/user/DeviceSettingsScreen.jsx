// ============================================================
// 2. app/user/DeviceSettingsScreen.jsx (수정)
// ============================================================

import { useRouter } from "expo-router";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { checkBLEStatus } from "../../utils/ble/checkStatus";
import { 
  startDeviceScanAndConnect, 
  reconnectWithSavedSerial 
} from "../../utils/ble/startDeviceScanAndConnect";
import bleManager from "../../utils/ble/bleManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useCallback, useState } from "react";
import { styles } from "../styles/userStyles";

const requestBLEPermissions = async () => {
  if (Platform.OS === "android") {
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

    if (!allGranted) throw new Error("BLE 권한이 거부되었습니다.");
  }
};

export default function DeviceSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  
  // 시리얼 번호 입력 모달 관련 상태
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");

  // 재연결 관련 상태
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectFailed, setReconnectFailed] = useState(false);
  const [reconnectError, setReconnectError] = useState("");

  // 자동 재연결 시도
  const checkAlreadyConnected = useCallback(async () => {
    try {
      await requestBLEPermissions();
      await checkBLEStatus();

      setReconnecting(true);
      setReconnectFailed(false);

      reconnectWithSavedSerial(
        (connectedDevice) => {
          console.log('✅ 자동 재연결 성공:', connectedDevice.id);
          setConnectedDeviceId(connectedDevice.id);
          setReconnecting(false);
          setReconnectFailed(false);
        },
        (error) => {
          console.warn('⚠️ 자동 재연결 실패:', error);
          setReconnecting(false);
          setReconnectFailed(true);
          setReconnectError(error);
        }
      );
    } catch (err) {
      console.error("연결 확인 실패:", err.message);
      setReconnecting(false);
      setReconnectFailed(true);
      setReconnectError(err.message);
    }
  }, []);

  useEffect(() => {
    checkAlreadyConnected();
    const timer = setTimeout(() => setInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, [checkAlreadyConnected]);

  // 재연결 재시도
  const handleRetryReconnect = () => {
    setReconnectFailed(false);
    checkAlreadyConnected();
  };

  // 저장된 정보 삭제하고 새로 연결
  const handleNewConnection = async () => {
    await AsyncStorage.removeItem("lastConnectedDeviceId");
    await AsyncStorage.removeItem("deviceSerialNumber");
    setReconnectFailed(false);
    setShowSerialModal(true);
  };

  // 시리얼 번호 입력 후 BLE 연결
  const handleBLEConnect = async () => {
    if (!serialNumber.trim()) {
      Alert.alert("입력 오류", "시리얼 번호를 입력해주세요.");
      return;
    }

    setShowSerialModal(false);
    setLoading(true);

    try {
      await requestBLEPermissions();
      await checkBLEStatus();

      startDeviceScanAndConnect(
        serialNumber.trim(),
        (connectedDevice) => {
          setLoading(false);
          setConnectedDeviceId(connectedDevice.id);
          setSerialNumber("");
          Alert.alert("연결 성공", "기기와 성공적으로 연결되었습니다.");
          router.push(`/user/${connectedDevice.id}`);
        },
        (error) => {
          setLoading(false);
          Alert.alert("연결 실패", error);
        }
      );
    } catch (err) {
      setLoading(false);
      Alert.alert("BLE 연결 실패", err.message);
    }
  };

  // 연결 해제
  const handleBLEDisconnect = async () => {
    try {
      if (connectedDeviceId) {
        const device = await bleManager.devices([connectedDeviceId]).then(arr => arr[0]);
        if (device) await device.cancelConnection();
      }
    } catch (err) {
      console.warn("BLE 연결 해제 중 오류:", err.message);
    } finally {
      await AsyncStorage.removeItem("lastConnectedDeviceId");
      await AsyncStorage.removeItem("deviceSerialNumber");
      setConnectedDeviceId(null);
      Alert.alert("연결 해제", "기기와의 연결이 해제되었습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!connectedDeviceId && !reconnecting && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              아직 연동된 기기가 없습니다~
            </Text>
          </View>
        )}

        {initializing || loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 16 }}>
              {loading ? "기기를 검색하고 있습니다..." : "초기화 중..."}
            </Text>
          </>
        ) : (
          <>
            {/* 재연결 중일 때 상태 표시 */}
            {reconnecting && (
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                  기기 재연결 중...
                </Text>
                <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                  저장된 기기와 연결을 시도하고 있습니다
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.connectButton,
                (reconnecting || loading) && styles.disabledButton
              ]}
              onPress={
                connectedDeviceId
                  ? () => router.push(`/user/${connectedDeviceId}`)
                  : () => setShowSerialModal(true)
              }
              disabled={reconnecting || loading}
            >
              <Text style={styles.connectButtonText}>
                {connectedDeviceId 
                  ? "기기 상세 보기" 
                  : reconnecting 
                    ? "재연결 중..." 
                    : "카트 연결 버튼"
                }
              </Text>
            </TouchableOpacity>

            {connectedDeviceId && (
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleBLEDisconnect}
              >
                <Text style={styles.disconnectButtonText}>연결 해제</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* 🔽 재연결 실패 모달 */}
      <Modal
        visible={reconnectFailed}
        transparent
        animationType="fade"
        onRequestClose={() => setReconnectFailed(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>재연결 실패</Text>
            <Text style={styles.modalText}>
              저장된 기기와의 연결에 실패했습니다.
            </Text>
            {reconnectError ? (
              <Text
                style={{
                  marginTop: 8,
                  color: '#dc2626',
                  textAlign: 'center',
                  fontSize: 13,
                }}
              >
                {reconnectError}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReconnectFailed(false)}
              >
                <Text style={styles.confirmBtnText}>닫기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleRetryReconnect}
              >
                <Text style={styles.confirmBtnText}>다시 연결</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 시리얼 번호 입력 모달 */}
      <Modal
        visible={showSerialModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSerialModal(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>시리얼 번호 입력</Text>
            <Text style={styles.modalText}>
              카트에 부착된 시리얼 번호를 입력하세요
            </Text>
            
            <TextInput
              style={styles.codeInput}
              placeholder="예: HJB1234"
              value={serialNumber}
              onChangeText={setSerialNumber}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowSerialModal(false);
                  setSerialNumber("");
                }}
              >
                <Text style={styles.confirmBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleBLEConnect}
              >
                <Text style={styles.confirmBtnText}>연결</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>기기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/user/UserAccountScreen")}
        >
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/user/UserSettingsScreen")}
        >
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
