// app/guardian/GuardianScreen.jsx

"use client";

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

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

  // --- 3. 사용자 데이터를 state로 관리 ---
  const [users, setUsers] = useState([
    { id: 1, name: "사용자 1" },
    { id: 2, name: "사용자 2" },
  ]);

  // 사용자 카드를 눌렀을 때 실행될 공통 함수
  const handleUserPress = (user) => {
    Alert.alert("알림", `${user.name}의 상세 정보를 확인합니다.`);
    router.push("/map/MapGuardian");
  };

  const handleAddUser = () => {
    router.push("/guardian/AccountLinkScreen");
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
      {/* 분리된 Header 컴포넌트 사용 */}
      <Header title="보호자" />

      <View style={styles.content}>
        {/* User List: map 함수로 동적 렌더링 */}
        <View style={styles.userList}>
          {users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onPress={() => handleUserPress(user)} 
            />
          ))}
        </View>

        {/* Add User Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>새 사용자 연결</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation (이 부분도 나중에 별도 컴포넌트로 분리하면 좋습니다) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={handleLocationNav}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>위치 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleAccountNav}>
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettingsNav}>
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}