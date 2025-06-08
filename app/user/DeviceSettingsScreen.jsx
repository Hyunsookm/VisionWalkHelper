// DeviceSettingsScreen.jsx

import { useRouter } from "expo-router";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { checkBLEStatus } from "../../utils/ble/checkStatus";
import { startDeviceScanAndConnect } from "../../utils/ble/startDeviceScanAndConnect";
import bleManager from "../../utils/ble/bleManager";
import { useEffect, useCallback } from "react";

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

  // 1) BLE 연결된 기기 조회: 권한/상태 확인 후 실행
  const checkAlreadyConnected = useCallback(async () => {
    try {
      // 권한 요청 및 BLE 상태 확인
      await requestBLEPermissions();
      await checkBLEStatus();

      // 빈 배열을 전달해서 현재 연결된 모든 기기 조회
      const connected = await bleManager.connectedDevices([]);
      if (connected.length > 0) {
        const deviceId = connected[0].id;
        // 문자열 경로로만 replace
        router.replace(`/user/${deviceId}`);
      }
    } catch (err) {
      console.error("이미 연결된 기기 조회 실패:", err);
      // 권한이나 BLE 상태 오류일 수 있으니, 화면 멈춤 없이 경고만 띄우기
      Alert.alert("오류", "이미 연결된 기기 조회 중 문제가 발생했습니다.");
    }
  }, [router]);

  useEffect(() => {
    checkAlreadyConnected();
  }, [checkAlreadyConnected]);

  // 2) BLE 연결 버튼 눌렀을 때 스캔 & 연결
  const handleBLEConnect = async () => {
    try {
      await requestBLEPermissions();
      await checkBLEStatus();

      startDeviceScanAndConnect((connectedDevice) => {
        router.push(`/user/${connectedDevice.id}`);
      });
    } catch (err) {
      Alert.alert("BLE 연결 실패", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기기 설정</Text>
        <TouchableOpacity>
          <Icon name="bell" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            아직 연동된 기기가{"\n"}없습니다~
          </Text>
        </View>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleBLEConnect}
        >
          <Text style={styles.connectButtonText}>BLE 장치 연결</Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  messageContainer: {
    marginBottom: 32,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 28,
  },
  connectButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  navIcon: {
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
  },
});
