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
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { checkBLEStatus } from "../../utils/ble/checkStatus";
import { startDeviceScanAndConnect } from "../../utils/ble/startDeviceScanAndConnect";
import bleManager from "../../utils/ble/bleManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useCallback, useState } from "react";

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

  const checkAlreadyConnected = useCallback(async () => {
    try {
      await requestBLEPermissions();
      await checkBLEStatus();

      const savedId = await AsyncStorage.getItem("lastConnectedDeviceId");
      if (!savedId || savedId.length < 5) return;

      try {
        const device = await bleManager.connectToDevice(savedId);
        await device.discoverAllServicesAndCharacteristics();
        console.log("✅ 저장된 MAC으로 재연결 성공:", device.id);
        setConnectedDeviceId(device.id);
      } catch (connectErr) {
        console.warn("❌ 저장된 MAC으로 재연결 실패, 제거 중");
        await AsyncStorage.removeItem("lastConnectedDeviceId");
      }
    } catch (err) {
      console.error("연결 확인 실패:", err.message);
    }
  }, []);

  useEffect(() => {
    checkAlreadyConnected();
    const timer = setTimeout(() => setInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, [checkAlreadyConnected]);

  const handleBLEConnect = async () => {
    setLoading(true);
    try {
      await requestBLEPermissions();
      await checkBLEStatus();

      const scanTimeout = setTimeout(() => {
        setLoading(false);
      }, 10000);

      startDeviceScanAndConnect(async (connectedDevice) => {
        clearTimeout(scanTimeout);
        setLoading(false);
        await AsyncStorage.setItem("lastConnectedDeviceId", connectedDevice.id);
        setConnectedDeviceId(connectedDevice.id);
        router.push(`/user/${connectedDevice.id}`);
      });
    } catch (err) {
      setLoading(false);
      Alert.alert("BLE 연결 실패", err.message);
    }
  };

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
      setConnectedDeviceId(null);
      Alert.alert("연결 해제", "기기와의 연결이 해제되었습니다.");
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
            아직 연동된 기기가{`\n`}없습니다~
          </Text>
        </View>

        {initializing || loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={
                connectedDeviceId
                  ? () => router.push(`/user/${connectedDeviceId}`)
                  : handleBLEConnect
              }
            >
              <Text style={styles.connectButtonText}>
                {connectedDeviceId ? "기기 상세 보기" : "카트 연결 버튼"}
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
  container: { flex: 1, backgroundColor: "#f9fafb" },
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
    marginBottom: 12,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  disconnectButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  disconnectButtonText: {
    color: "#fff",
    fontSize: 16,
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
