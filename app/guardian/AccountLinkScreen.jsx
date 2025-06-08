// app/guardian/AccountLinkScreen.jsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function AccountLinkScreen() {
  const router = useRouter();
  const users = ["사용자 1", "사용자 2"];
  
  // 모달 상태
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState("");

  // 연동 해제 확인
  const confirmUnlink = () => {
    Alert.alert("알림", `${unlinkTarget}의 연동이 해제되었습니다.`);
    setUnlinkTarget(null);
  };

  // 연동 코드 확인
  const confirmLink = () => {
    Alert.alert("연동 코드", `입력하신 코드: ${code}`);
    setCode("");
    setShowCodeModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>연동 관리</Text>
        <TouchableOpacity>
          <Feather name="bell" size={24} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* 연동된 사용자 리스트 */}
        <View style={styles.userList}>
          {users.map((u) => (
            <TouchableOpacity
              key={u}
              style={styles.userCard}
              onPress={() => setUnlinkTarget(u)}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Feather name="user" size={24} color="#fff" />
                </View>
                <Text style={styles.userName}>{u}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 계정 연동 버튼 (리스트 아래) */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setShowCodeModal(true)}
        >
          <Text style={styles.linkButtonText}>계정 연동</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem
          label="위치 확인"
          icon="shopping-cart"
          active={false}
          onPress={() => router.push("/guardian/GuardianScreen")}
        />
        <NavItem
          label="계정"
          icon="user"
          active={true}
          onPress={() => router.push("/guardian/AccountLinkScreen")}
        />
        <NavItem
          label="설정"
          icon="settings"
          active={false}
          onPress={() => router.push("/guardian/GuardianSettingsScreen")}
        />
      </View>

      {/* 연동 해제 Confirmation Modal */}
      {unlinkTarget && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setUnlinkTarget(null)}
        >
          <View style={styles.backdrop}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setUnlinkTarget(null)}
              >
                <Feather name="x" size={20} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>연동을 해제하시겠습니까?</Text>
              <Text style={styles.modalUser}>{unlinkTarget}</Text>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.unlinkBtn]}
                onPress={confirmUnlink}
              >
                <Text style={[styles.confirmBtnText, styles.unlinkBtnText]}>
                  연동 해제
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 연동 코드 입력 Modal */}
      {showCodeModal && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowCodeModal(false)}
        >
          <View style={styles.backdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>연동 코드 입력</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="코드를 입력하세요"
                value={code}
                onChangeText={setCode}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.actionBtn]}
                  onPress={confirmLink}
                >
                  <Text style={styles.confirmBtnText}>확인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, styles.cancelBtn]}
                  onPress={() => setShowCodeModal(false)}
                >
                  <Text style={[styles.confirmBtnText, styles.cancelText]}>
                    취소
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// NavItem
function NavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={24}
        color={active ? "#000000" : "#000000"}
      />
      <Text style={[styles.navText, active && styles.navTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerBtn: { width: 32, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  content: { flex: 1,     paddingHorizontal: 24,
    paddingVertical: 24 },
  userList: {},
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userName: { fontSize: 18 },

  linkButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center"
  },
  linkButtonText: { color: "#fff", fontSize: 18, fontWeight: "500" },

  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navItemActive: { backgroundColor: "#f3f4f6" },
  navText: { fontSize: 12, color: "#000000", marginTop: 4 },
  navTextActive: { color: "#000000" },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
  },
  modalClose: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  modalUser: { fontSize: 18, color: "#dc2626", marginBottom: 24 },

  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  confirmBtnText: { fontSize: 16, fontWeight: "500" },

  // 해제(삭제) 버튼
  unlinkBtn: {
    backgroundColor: "#dc2626",
  },
  unlinkBtnText: {
    color: "#fff",
  },

  // 코드 입력 모달용
  codeInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  actionBtn: { flex: 1 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22c55e",
    marginLeft: 12,
  },
  cancelText: { color: "#22c55e" },
});
