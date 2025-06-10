// app/user/UserAccountScreen.jsx

"use client";

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/Feather";

export default function UserAccountScreen() {
  const router = useRouter();

  // state
  const [linkedGuardians, setLinkedGuardians] = useState([]);
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);

  // fetch linked guardians on mount
  useEffect(() => {
    const fetchLinked = async () => {
      try {
        const auth = getAuthInstance();
        const uid = auth.currentUser.uid;
        const q = query(
          collection(db, "peers"),
          where("userUid", "==", uid),
          where("status", "==", "linked")
        );
        const snap = await getDocs(q);
        setLinkedGuardians(
          snap.docs.map(doc => ({
            code: doc.id,
            guardianUid: doc.data().guardianUid
          }))
        );
      } catch (e) {
        console.error("링크된 보호자 불러오기 실패:", e);
      }
    };
    fetchLinked();
  }, []);

  // auth timer for code popup
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

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      router.replace("/login/LoginScreen");
    } catch (e) {
      Alert.alert("로그아웃 실패", e.message);
    }
  };

  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // open code popup & save pending request
  const handleAuthPopup = async () => {
    const newCode = generateCode();
    setAuthCode(newCode);
    setTimeLeft(180);
    setShowAuthPopup(true);

    try {
      const auth = getAuthInstance();
      const uid = auth.currentUser.uid;
      const peerRef = doc(db, "peers", newCode);
      await setDoc(peerRef, {
        userUid: uid,
        code: newCode,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("연동 요청 저장 실패:", e);
      Alert.alert("오류", "연동 요청을 저장하지 못했습니다.");
    }
  };

  // confirm unlink guardian
  const confirmUnlink = async () => {
    try {
      const peerRef = doc(db, "peers", unlinkTarget.code);
      await updateDoc(peerRef, {
        status: "pending",
        guardianUid: "",
        linkedAt: null,
      });
      setLinkedGuardians(prev =>
        prev.filter(u => u.code !== unlinkTarget.code)
      );
      Alert.alert("연동 해제", "보호자 연동이 해제되었습니다.");
      setUnlinkTarget(null);
    } catch (e) {
      console.error("연동 해제 실패:", e);
      Alert.alert("오류", "연동 해제에 실패했습니다.");
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <Text style={styles.userName}>홍길동</Text>
        </View>

        {/* Linked Guardians */}
        <Text style={styles.sectionTitle}>연동된 보호자</Text>
        {linkedGuardians.length === 0 ? (
          <Text style={styles.emptyText}>아직 연결된 보호자가 없습니다.</Text>
        ) : (
          linkedGuardians.map(u => (
            <TouchableOpacity
              key={u.code}
              style={styles.userCard}
              onPress={() => setUnlinkTarget(u)}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Feather name="user" size={24} color="#fff" />
                </View>
                <Text style={styles.userName}>{u.guardianUid}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleAuthPopup}
        >
          <Text style={styles.linkButtonText}>보호자 연동</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Unlink Confirmation */}
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
              보호자({unlinkTarget?.guardianUid})를 연동 해제하시겠습니까?
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.unlinkBtn]}
              onPress={confirmUnlink}
            >
              <Text style={styles.confirmBtnText}>연동 해제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

     <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>기기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
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
      {/* Auth Code Popup */}
      <Modal
        visible={showAuthPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAuthPopup(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            {/* X 닫기 버튼 */}
            <TouchableOpacity
              onPress={() => setShowAuthPopup(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>연동 인증번호</Text>
            <Text style={styles.authCodeText}>{authCode}</Text>
            <Text style={styles.authTimer}>{formatTime(timeLeft)}</Text>
            <Text style={styles.authText}>
              보호자 화면에 인증번호를 입력하세요
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
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
  profileSection: { marginBottom: 24 },
  userName: { fontSize: 24, fontWeight: "700" },
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  linkButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: { color: "#fff", fontSize: 18, fontWeight: "500" },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonText: { color: "#fff", fontSize: 18, fontWeight: "500" },
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
  activeNavItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  closeButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
  padding: 5,
},

closeButtonText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#999',
},

  modalBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
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
  unlinkBtn: { backgroundColor: "#dc2626", width: "100%" },
  confirmBtnText: { fontSize: 16, fontWeight: "500", color: "#fff" },
  authCodeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 8,
  },
  authTimer: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 8,
  },
  authText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
});