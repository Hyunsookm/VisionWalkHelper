// app/guardian/GuardianScreen.jsx

"use client";

import { useRouter } from "expo-router";
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
import { Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
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


import { styles } from "../styles/guardianStyles";

// --- 1. 헤더 컴포넌트 분리 ---
// title을 props로 받아 재사용 가능하도록 만듭니다.
const Header = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={() => Alert.alert("알림", "알림 화면으로 이동합니다.")}>
        <Icon name="bell" size={24} />
      </TouchableOpacity>
    </View>
  );
};

// --- 2. 사용자 카드 컴포넌트 분리 ---
// user 정보와 onPress 함수를 props로 받습니다.
const UserCard = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Icon name="user" size={24} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

// --- ✨ 메인 화면 컴포넌트 ---
export default function GuardianScreen() {
 const router = useRouter();
 const [unlinkTarget, setUnlinkTarget] = useState(null);
 const [showCodeModal, setShowCodeModal] = useState(false);
 const [code, setCode] = useState("");
 const [userName, setUserName] = useState("");
 const [linkedUsers, setLinkedUsers] = useState([]);

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


  const handleOpenUser = (u) => {
    router.push({
      pathname: "/map/MapGuardian",
      params: {
        userUid: u.userUid,
        displayName: u.guardianDisplayName || u.userUid,
      },
    });
  };

  // 하단 네비게이션 핸들러
  const handleLocationNav = () => {
    router.push("/guardian/GuardianScreen");
  };

  const handleAccountNav = () => {
    router.push("/guardian/AccountLinkScreen");
  };

  const handleSettingsNav = () => {
    router.push("/guardian/GuardianSettingsScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>위치 확인</Text>
        <TouchableOpacity>
          <Feather name="bell" size={24} />
        </TouchableOpacity>
      </View>

      {/* Content (스크롤) */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>연동된 사용자</Text>

        {linkedUsers.length === 0 && (
          <Text style={styles.emptyText} allowFontScaling={false}>
            아직 연결된 사용자가 없습니다.
          </Text>
        )}

        {linkedUsers.map((u) => (
          <TouchableOpacity
            key={u.code}
            style={styles.userCard}
            onPress={() => handleOpenUser(u)}
            activeOpacity={0.8}
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

      </ScrollView>

      {/* Bottom Navigation (고정) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={handleLocationNav}
        >
          <Feather name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>위치 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleAccountNav}>
          <Feather name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettingsNav}>
          <Feather name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 공통 레이아웃
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
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" },

  content: {
    padding: 24,
    paddingBottom: 40,      // 하단바와 겹치지 않도록
  },

  // 섹션/빈 상태 문구 (AccountLinkScreen과 동일 톤)
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  emptyText: { color: "#9ca3af", fontSize: 13, lineHeight: 18, marginBottom: 12 },

  // 사용자 카드
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

  // 계정 연동 버튼 (첫 번째 스샷 맞춤)
  linkButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  linkButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },

  // 하단 네비 (고정)
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  activeNavItem: { backgroundColor: "#f3f4f6", borderRadius: 8 },
  navIcon: { marginBottom: 4 },
  navText: { fontSize: 12 },
});
