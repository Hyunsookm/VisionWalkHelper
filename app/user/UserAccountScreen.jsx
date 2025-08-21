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

import { styles } from "../styles/userStyles";

export default function UserAccountScreen() {
  const router = useRouter();

  // state
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [editedGuardianName, setEditedGuardianName] = useState("");
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
            guardianUid: doc.data().guardianUid,
            userSideName: doc.data().userSideName || null,
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

    const handleSaveGuardianName = async () => {
      try {
        const peerRef = doc(db, "peers", editingGuardian.code);
        await updateDoc(peerRef, { userSideName: editedGuardianName });
        setLinkedGuardians(prev =>
          prev.map(g =>
            g.code === editingGuardian.code
              ? { ...g, userSideName: editedGuardianName }
              : g
          )
        );
        setEditingGuardian(null);
        setEditedGuardianName("");
      } catch (e) {
        console.error("이름 업데이트 실패:", e);
        Alert.alert("오류", "보호자 이름을 저장하지 못했습니다.");
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
          <View key={u.code} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>
                {u.userSideName || "이름을 설정해주세요"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* 이름 수정 버튼 */}
              <TouchableOpacity
                onPress={() => {
                  setEditingGuardian(u);
                  setEditedGuardianName(u.userSideName || "");
                  setUnlinkTarget(null);
                }}
                style={{ marginRight: 12 }}
              >
                <Feather name="edit-3" size={20} color="#3b82f6" />
              </TouchableOpacity>

              {/* 연동 해제 버튼 */}
              <TouchableOpacity
                onPress={() => {
                  setUnlinkTarget(u);
                  setEditingGuardian(null);
                }}
              >
                <Feather name="x-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Actions */}
      <TouchableOpacity style={styles.linkButton} onPress={handleAuthPopup}>
        <Text style={styles.linkButtonText}>보호자 연동</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>

    {/* 이름 설정 Modal */}
    <Modal
      visible={!!editingGuardian}
      transparent
      animationType="fade"
      onRequestClose={() => setEditingGuardian(null)}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>보호자 이름 설정</Text>
          <TextInput
            value={editedGuardianName}
            onChangeText={setEditedGuardianName}
            placeholder="이름 입력"
            style={styles.codeInput}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveGuardianName}>
              <Text style={styles.confirmBtnText}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.cancelBtn]}
              onPress={() => setEditingGuardian(null)}
            >
              <Text style={styles.confirmBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

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
          보호자({unlinkTarget?.userSideName || "이름 미지정"})를 연동 해제하시겠습니까?
        </Text>
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.confirmBtn, styles.unlinkBtn]}
            onPress={confirmUnlink}
          >
            <Text style={styles.confirmBtnText}>연동 해제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, styles.cancelBtn]}
            onPress={() => setUnlinkTarget(null)}
          >
            <Text style={styles.confirmBtnText}>취소</Text>
          </TouchableOpacity>
        </View>
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

