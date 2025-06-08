// app/guardian/AccountLinkScreen.jsx

"use client";

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function AccountLinkScreen() {
  const router = useRouter();
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [linkedUsers, setLinkedUsers] = useState([]);

  // Firestore에서 연동된 사용자들 불러오기
  useEffect(() => {
    const fetchLinked = async () => {
      try {
        const auth = getAuthInstance();
        const guardianUid = auth.currentUser.uid;

        const q = query(
          collection(db, "peers"),
          where("guardianUid", "==", guardianUid),
          where("status", "==", "linked")
        );
        const snap = await getDocs(q);
        const users = snap.docs.map(doc => ({
          code: doc.id,
          userUid: doc.data().userUid
        }));
        setLinkedUsers(users);
      } catch (e) {
        console.error("링크된 사용자 불러오기 실패:", e);
      }
    };
    fetchLinked();
  }, []);

  // 연동 해제
  const confirmUnlink = async () => {
    try {
      const peerRef = doc(db, "peers", unlinkTarget.code);
      await updateDoc(peerRef, {
        status: "pending",    // 또는 삭제: deleteDoc
        guardianUid: "",
        linkedAt: null,
      });
      Alert.alert("알림", `${unlinkTarget.userUid}의 연동이 해제되었습니다.`);
      setUnlinkTarget(null);
      // 목록 갱신
      setLinkedUsers(prev => prev.filter(u => u.code !== unlinkTarget.code));
    } catch (e) {
      console.error("연동 해제 실패:", e);
      Alert.alert("오류", "연동 해제에 실패했습니다.");
    }
  };

  // 연동 코드 입력 & Firestore 업데이트
  const confirmLink = async () => {
    if (!code.trim()) {
      return Alert.alert("알림", "코드를 입력해주세요.");
    }
    try {
      const peerRef = doc(db, "peers", code.trim());
      const snap = await getDoc(peerRef);
      if (!snap.exists() || snap.data().status !== "pending") {
        throw new Error("유효한 요청이 아닙니다.");
      }

      const auth = getAuthInstance();
      const guardianUid = auth.currentUser.uid;

      await updateDoc(peerRef, {
        guardianUid,
        status: "linked",
        linkedAt: serverTimestamp(),
      });

      // 연동된 사용자 목록에 추가
      setLinkedUsers(prev => [
        ...prev,
        { code: code.trim(), userUid: snap.data().userUid }
      ]);

      Alert.alert("연동 성공", `사용자(${snap.data().userUid})와 연결되었습니다.`);
      setCode("");
      setShowCodeModal(false);
    } catch (err) {
      console.error("연동 실패:", err);
      Alert.alert("연동 실패", err.message);
    }
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* 기존 ‘연동된 사용자’ */}
        <Text style={styles.sectionTitle}>연동된 사용자</Text>
        {linkedUsers.length === 0 && (
          <Text style={styles.emptyText}>아직 연결된 사용자가 없습니다.</Text>
        )}
        {linkedUsers.map((u) => (
          <TouchableOpacity
            key={u.code}
            style={styles.userCard}
            onPress={() => setUnlinkTarget(u)}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>{u.userUid}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {/* 계정 연동 버튼 */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setShowCodeModal(true)}
        >
          <Text style={styles.linkButtonText}>계정 연동</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 연동 해제 Modal */}
      <Modal
        visible={!!unlinkTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setUnlinkTarget(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>연동 해제</Text>
            <Text style={styles.modalMessage}>
              {unlinkTarget?.userUid}님의 연동을 해제하시겠습니까?
            </Text>
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

      {/* 연동 코드 입력 Modal */}
      <Modal
        visible={showCodeModal}
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
    </SafeAreaView>
  );
}

function NavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={24}
        color={active ? "#000000" : "#6b7280"}
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

  content: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  emptyText: { color: "#6b7280", marginBottom: 16 },

  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: { color: "#fff", fontSize: 18, fontWeight: "500" },

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
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  modalMessage: { fontSize: 16, marginBottom: 24, textAlign: "center" },

  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#22c55e",
  },
  unlinkBtn: { backgroundColor: "#dc2626", marginTop: 12 },
  confirmBtnText: { fontSize: 16, fontWeight: "500", color: "#fff" },
  cancelText: { color: "#22c55e" },

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
  },

  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: { flex: 1, alignItems: "center", padding: 8 },
  navItemActive: { backgroundColor: "#f3f4f6" },
  navText: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  navTextActive: { color: "#000000" },
});