// app/setting/UserSettingScreen.jsx

import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Switch as RNSwitch,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function UserSettingScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      router.replace("/login/LoginScreen");
    } catch (e) {
      Alert.alert("로그아웃 실패", e.message);
    }
  };

  // 메인 화면으로 이동 전에 role 필드를 빈 문자열로 업데이트
  const handleGoMain = async () => {
    try {
      const user = getAuthInstance().currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { role: "" });
      }
      router.push("/RoleSelectionScreen");
    } catch (e) {
      Alert.alert("업데이트 실패", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ───────── Header ───────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerButton} />
      </View>

      {/* ───────── Content ───────── */}
      <View style={styles.container}>
        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.rowText}>로그아웃</Text>
          <Feather name="log-out" size={20} />
        </TouchableOpacity>

        {/* 메인화면으로 가기 */}
        <TouchableOpacity style={styles.row} onPress={handleGoMain}>
          <Text style={styles.rowText}>메인화면으로 가기</Text>
          <Feather name="chevron-right" size={20} />
        </TouchableOpacity>

        {/* 푸시 알림 토글 */}
        <View style={styles.row}>
          <Text style={styles.rowText}>푸시 알림 설정</Text>
          <RNSwitch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor={pushEnabled ? "#ffffff" : "#f9fafb"}
          />
        </View>

        {/* 더보기 모달 열기 */}
        <TouchableOpacity style={styles.row} onPress={() => setShowInfo(true)}>
          <Text style={styles.rowText}>더보기</Text>
          <Feather name="chevron-right" size={20} />
        </TouchableOpacity>
      </View>

      {/* ───────── Bottom Navigation ───────── */}
      <View style={styles.bottomNav}>
        <NavItem
          label="기기"
          icon="shopping-cart"
          active={false}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        />
        <NavItem
          label="계정"
          icon="user"
          active={false}
          onPress={() => router.push("/user/UserAccountScreen")}
        />
        <NavItem
          label="설정"
          icon="settings"
          active={true}
          onPress={() => router.push("/user/UserSettingScreen")}
        />
      </View>

      {/* ───────── More Info Modal ───────── */}
      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalClose}>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Feather name="x" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>애플리케이션 정보</Text>
              <Image style={styles.modalImage} />
              <Text style={styles.modalText}>
                이 애플리케이션은 낙상 감지 기능을 통해 사용자의 안전을 모니터링합니다.
                보호자와 연동하여 실시간으로 위치와 상태를 공유할 수 있습니다.
              </Text>
              <Text style={styles.modalText}>버전: 1.0</Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Feather name={icon} size={24} color={"#000000"} />
      <Text style={[styles.navText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerButton: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowText: {
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
    justifyContent: "center",
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: "#f3f4f6",
  },
  navText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  navTextActive: {
    color: "#22c55e",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
  },
  modalClose: {
    alignItems: "flex-end",
  },
  modalBody: {
    alignItems: "center",
    marginVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
  },
  modalText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});