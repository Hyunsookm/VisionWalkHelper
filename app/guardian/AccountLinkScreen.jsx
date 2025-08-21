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
import Icon from "react-native-vector-icons/Feather";

import { styles } from "../styles/guardianStyles";

export default function AccountLinkScreen() {
  const router = useRouter();
  const [unlinkTarget, setUnlinkTarget] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [userName, setUserName] = useState("");
  const [linkedUsers, setLinkedUsers] = useState([]);

  // 연동된 사용자 가져오기
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
          userUid: doc.data().userUid,
          guardianDisplayName: doc.data().guardianDisplayName || null,
        }));
        setLinkedUsers(users);
      } catch (e) {
        console.error("링크된 사용자 불러오기 실패:", e);
      }
    };
    fetchLinked();
  }, []);

  const confirmUnlink = async () => {
    try {
      const peerRef = doc(db, "peers", unlinkTarget.code);
      await updateDoc(peerRef, {
        status: "pending",
        guardianUid: "",
        linkedAt: null,
      });
      Alert.alert("알림", `${unlinkTarget.userUid}의 연동이 해제되었습니다.`);
      setUnlinkTarget(null);
      setLinkedUsers(prev => prev.filter(u => u.code !== unlinkTarget.code));
    } catch (e) {
      console.error("연동 해제 실패:", e);
      Alert.alert("오류", "연동 해제에 실패했습니다.");
    }
  };

  const confirmLink = async () => {
    if (!code.trim() || !userName.trim()) {
      return Alert.alert("알림", "코드와 이름을 모두 입력해주세요.");
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
        guardianDisplayName: userName.trim(),
        status: "linked",
        linkedAt: serverTimestamp(),
      });

      setLinkedUsers(prev => [
        ...prev,
        {
          code: code.trim(),
          userUid: snap.data().userUid,
          guardianDisplayName: userName.trim(),
        },
      ]);

      Alert.alert("연동 성공", `사용자(${userName})와 연결되었습니다.`);
      setCode("");
      setUserName("");
      setShowCodeModal(false);
    } catch (err) {
      console.error("연동 실패:", err);
      Alert.alert("연동 실패", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
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
              <Text style={styles.userName}>
                {u.guardianDisplayName || u.userUid}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}

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
        {unlinkTarget?.guardianDisplayName || unlinkTarget?.userUid}님의 연동을 해제하시겠습니까?
      </Text>

      {/* 버튼 영역 */}
      <View style={styles.modalActions}>

      {/* 확인 버튼 */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: "#dc2626" }]}
        onPress={confirmUnlink}
      >
        <Text style={styles.actionBtnText}>확인</Text>
      </TouchableOpacity>

        {/* 취소 버튼 */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#6b7280" }]}
          onPress={() => setUnlinkTarget(null)}
        >
          <Text style={styles.actionBtnText}>취소</Text>
        </TouchableOpacity>

      </View>
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
            <TextInput
              style={styles.codeInput}
              placeholder="사용자 이름을 입력하세요"
              value={userName}
              onChangeText={setUserName}
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
                onPress={() => {
                  setShowCodeModal(false);
                  setCode("");
                  setUserName("");
                }}
              >
                <Text style={[styles.confirmBtnText, styles.cancelText]}>
                  취소
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/guardian/GuardianScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>위치 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/guardian/AccountLinkScreen")}
        >
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/guardian/GuardianSettingsScreen")}
        >
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
