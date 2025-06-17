// RoleSelectionScreen.js

import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useEffect, useState } from "react";

import { getAuthInstance, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true); // Firestore에서 role을 확인 중인지 여부
  const [userRole, setUserRole] = useState(null);

  // 1) 컴포넌트 마운트 시에 Firestore에서 현재 사용자의 role을 확인
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const auth = getAuthInstance();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // 인증된 사용자가 없으면 로그인 화면으로 돌아갑니다.
          router.replace("/login/LoginScreen");
          return;
        }

        const uid = currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          // data가 있으면 data.role을 읽어오고, 없으면 roleValue를 null로 둡니다.
          const roleValue = data && data.role ? data.role : null;

          if (roleValue) {
            // 이미 role이 설정된 상태라면 바로 해당 화면으로 이동
            setUserRole(roleValue);
            if (roleValue === "사용자") {
              router.replace("/user/DeviceSettingsScreen");
            } else if (roleValue === "보호자") {
              router.replace("/guardian/GuardianScreen");
            }
            return;
          }
        }

        // role이 없을 경우, 선택 대기 상태로 두고 로딩 스피너를 숨깁니다.
        setCheckingRole(false);
      } catch (e) {
        console.error("Role 읽기 실패:", e);
        Alert.alert("오류", "사용자 정보를 불러오는 데 실패했습니다.");
        setCheckingRole(false);
      }
    };

    checkUserRole();
  }, []);

  // 2) 사용자 또는 보호자 버튼을 눌렀을 때 DB에 role을 업데이트하고 화면 전환
  const handleRoleSelection = async (selectedRole) => {
    try {
      setCheckingRole(true);
      const auth = getAuthInstance();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("오류", "로그인 정보가 없습니다.");
        setCheckingRole(false);
        return;
      }

      const uid = currentUser.uid;
      const userRef = doc(db, "users", uid);

      // Firestore에 role 필드만 merge 옵션으로 업데이트
      await setDoc(
        userRef,
        { role: selectedRole },
        { merge: true }
      );

      // 업데이트가 완료되면 해당 역할 화면으로 이동
      if (selectedRole === "사용자") {
        router.replace("/user/DeviceSettingsScreen");
      } else if (selectedRole === "보호자") {
        router.replace("/guardian/GuardianScreen");
      }
    } catch (e) {
      console.error("Role 업데이트 실패:", e);
      Alert.alert("오류", "역할 선택을 저장하는 데 실패했습니다.");
      setCheckingRole(false);
    }
  };

  // 3) 로그아웃 버튼 핸들러
  const handleLogout = () => {
    // 필요하다면 auth.signOut() 등을 호출
    router.replace("/login/LoginScreen");
  };

  // 로딩 상태일 때 스피너 표시
  if (checkingRole) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  // role이 아직 설정되지 않은 상태: 역할 선택 UI 표시
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={48} color="#fff" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>로그인 성공~!</Text>
          <Text style={styles.subtitle}>사용자/보호자 중 역할을 선택하세요</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cardUserButton}
            onPress={() => handleRoleSelection("사용자")}
          >
            <Text style={styles.buttonText}>카트 사용자</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guardianButton}
            onPress={() => handleRoleSelection("보호자")}
          >
            <Text style={styles.buttonText}>보호자</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 32,
    width: 96,
    height: 96,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  cardUserButton: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 80,
  },
  guardianButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 80,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 48,
  },
  logoutText: {
    color: "#666",
    fontSize: 18,
  },
  bottomIndicator: {
    alignItems: "center",
    paddingBottom: 16,
  },
  indicator: {
    width: 128,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
});
