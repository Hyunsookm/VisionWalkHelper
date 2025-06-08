import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getAuthInstance } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

export default function UserAccountScreen() {
  const router = useRouter();
  const [showGuardianList, setShowGuardianList] = useState(false);
  const [showNoDeviceAlert, setShowNoDeviceAlert] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authCode] = useState("123456");
  const [timeLeft, setTimeLeft] = useState(180);

  // Auth timer
  useEffect(() => {
    let timer;
    if (showAuthPopup && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (showAuthPopup && timeLeft === 0) {
      Alert.alert("시간이 초과되었습니다");
      setShowAuthPopup(false);
      setTimeLeft(180);
    }
    return () => clearTimeout(timer);
  }, [showAuthPopup, timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const guardians = ["보호자1", "보호자2"];

  const handleDeviceInfoClick = () => {
    const hasConnectedDevice = false;
    if (!hasConnectedDevice) setShowNoDeviceAlert(true);
    else router.push("/user/DeviceSettingsScreen");
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      router.replace("/login/LoginScreen");
    } catch (e) {
      Alert.alert("로그아웃 실패", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용자 계정</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <Text style={styles.userName}>홍길동</Text>
        </View>
        <View style={styles.optionList}>
          <OptionRow label="비밀번호 변경" onPress={() => router.push("/change-password")} />
          <OptionRow label="보호자 목록" onPress={() => setShowGuardianList(true)} />
          <OptionRow label="보호자 연동" onPress={() => setShowAuthPopup(true)} />
          <OptionRow label="연결된 기기 정보" onPress={handleDeviceInfoClick} />
          <OptionRow label="로그아웃" onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem label="기기" icon="shopping-cart" active={false} onPress={() => router.push("/user/DeviceSettingsScreen")} />
        <NavItem label="계정" icon="user" active={true} onPress={() => router.push("/user/UserAccountScreen")} />
        <NavItem label="설정" icon="settings" active={false} onPress={() => router.push("/user/UserSettingsScreen")} />
      </View>

      {/* Guardian List Modal */}
      <Modal visible={showGuardianList} transparent animationType="fade" onRequestClose={() => setShowGuardianList(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>보호자 목록</Text>
              <TouchableOpacity onPress={() => setShowGuardianList(false)}>
                <Feather name="x" size={20} />
              </TouchableOpacity>
            </View>
            {guardians.map((g, i) => (
              <View key={i} style={styles.modalItem}>
                <Text style={styles.modalItemText}>{g}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnOutline]} onPress={() => setShowGuardianList(false)}>
              <Text style={[styles.modalBtnText, styles.modalBtnTextOutline]}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* No Device Alert Modal */}
      <Modal visible={showNoDeviceAlert} transparent animationType="fade" onRequestClose={() => setShowNoDeviceAlert(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>알림</Text>
            <Text style={styles.modalMessage}>연동된 기기가 없습니다</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowNoDeviceAlert(false)}>
              <Text style={styles.modalBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Auth Code Popup Modal */}
      <Modal visible={showAuthPopup} transparent animationType="fade" onRequestClose={() => setShowAuthPopup(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>연동 인증번호</Text>
              <TouchableOpacity onPress={() => setShowAuthPopup(false)}>
                <Feather name="x" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.authCodeText}>{authCode}</Text>
            <Text style={styles.authTimer}>{formatTime(timeLeft)}</Text>
            <Text style={styles.authText}>보호자 화면에 인증번호를 입력하세요</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OptionRow({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Feather name="chevron-right" size={20} />
    </TouchableOpacity>
  );
}

function NavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
      <Feather name={icon} size={24} color={active ? "#000" : "#6b7280"} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  header: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#fff" },
  headerBtn: { width: 32, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  content: { padding: 16 },
  profileSection: { marginBottom: 24 },
  userName: { fontSize: 24, fontWeight: "700" },
  optionList: { backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#fff" },
  rowText: { fontSize: 18, fontWeight: "500" },
  bottomNav: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  navItem: { flex: 1, alignItems: "center", padding: 8 },
  navItemActive: { backgroundColor: "#f3f4f6" },
  navText: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  navTextActive: { color: "#22c55e" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalBox: { width: "100%", maxWidth: 320, backgroundColor: "#fff", borderRadius: 8, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalMessage: { fontSize: 16, color: "#4B5563", textAlign: "center", marginBottom: 24 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  modalItemText: { fontSize: 16 },
  modalBtn: { backgroundColor: "#22c55e", padding: 12, borderRadius: 6, alignItems: "center" },
  modalBtnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#22c55e" },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  modalBtnTextOutline: { color: "#22c55e" },
  authCodeText: { fontSize: 20, fontWeight: "700", color: "#3b82f6", marginBottom: 8 },
  authTimer: { fontSize: 18, fontWeight: "600", color: "#ef4444", marginBottom: 8 },
  authText: { fontSize: 14, color: "#4B5563", textAlign: "center" }
});