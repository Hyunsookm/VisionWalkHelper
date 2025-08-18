import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Switch as RNSwitch } from "react-native";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/Feather";
import { signOut } from "firebase/auth";

export default function GuardianSettingsScreen() {
  const router = useRouter();
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(true);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

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
  // 로그아웃 핸들러
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
      {/* ───────── Header ───────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerButton} />
      </View>

      {/* ───────── Content ───────── */}
      <View style={styles.container}>
        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.rowText}>로그아웃</Text>
          <Feather name="chevron-right" size={20} color="#000" />
        </TouchableOpacity>

        {/* 메인화면으로 가기 */}
        <TouchableOpacity style={styles.row} onPress={handleGoMain}>
          <Text style={styles.rowText}>메인화면으로 가기</Text>
          <Feather name="chevron-right" size={20} color="#000" />
        </TouchableOpacity>

        {/* 낙상 알림 설정 */}
        <View style={styles.row}>
          <Text style={styles.rowText}>낙상 알림 설정</Text>
          <RNSwitch
            value={fallDetectionEnabled}
            onValueChange={setFallDetectionEnabled}
            trackColor={{ false: "#d1d5db", true: "#22c55e" }}
            thumbColor={fallDetectionEnabled ? "#ffffff" : "#f9fafb"}
          />
        </View>

        {/* 더보기 모달 열기 */}
        <TouchableOpacity style={styles.row} onPress={() => setShowMoreInfo(true)}>
          <Text style={styles.rowText}>더보기</Text>
          <Feather name="chevron-right" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ───────── Bottom Navigation ───────── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/guardian/GuardianScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>위치 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/guardian/AccountLinkScreen")}
        >
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/guardian/GuardianSettingsScreen")}
        >
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* ───────── More Info Modal ───────── */}
      <Modal
        visible={showMoreInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalClose}>
              <TouchableOpacity onPress={() => setShowMoreInfo(false)}>
                <Feather name="x" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>애플리케이션 정보</Text>
              <Text style={styles.modalText}>
                이 애플리케이션은 낙상 감지 기능을 통해 사용자의 안전을 모니터링합니다. 보호자는 사용자의 위치를 확인하고 낙상 알림을 받을 수 있습니다.
              </Text>
              <Text style={styles.modalText}>버전: 1.0</Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowMoreInfo(false)}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    activeNavItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  navText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  navTextActive: {
    color: "#000000",
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
    marginVertical: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
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
