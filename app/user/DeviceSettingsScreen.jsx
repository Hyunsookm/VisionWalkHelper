import { useRouter } from "expo-router";
import { Alert, Button, PermissionsAndroid, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { checkBLEStatus } from "../../utils/ble/checkStatus";
import { startDeviceScanAndConnect } from "../../utils/ble/startDeviceScanAndConnect";

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

const handleBLEConnect = async () => {
  try {
    await requestBLEPermissions();
    await checkBLEStatus();

    startDeviceScanAndConnect((connectedDevice) => {
      Alert.alert("연결 성공", `장치: ${connectedDevice.name || "알 수 없음"}`);
    });
  } catch (err) {
    Alert.alert("BLE 연결 실패", err.message);
  }
};

export default function DeviceSettingsScreen() {
  const router = useRouter();

  const handleDeviceConnection = () => {
    router.push("/user/DeviceDetailScreen");
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
          <Text style={styles.messageText}>아직 연동된 기기가{"\n"}없습니다~</Text>
        </View>

        <TouchableOpacity style={styles.connectButton} onPress={handleDeviceConnection}>
          <Text style={styles.connectButtonText}>기기 연동하기</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Button title="BLE 장치 연결" onPress={handleBLEConnect} color="#22c55e" />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>기기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/user/UserAccountScreen")}>
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/SettingsScreen")}>
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