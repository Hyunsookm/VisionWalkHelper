// LoginScreen.js

"use client";

import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { signInWithCustomToken } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import styles from "../styles/styles";

const SERVER_URL = "http://3.39.142.7:3000/kakao-login";

import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 임시: 로컬 로그인 성공 시 역할선택 화면으로 이동
  const handleLogin = async () => {
    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;
      if (user) {
        router.replace("/RoleSelectionScreen");
      } else {
        Alert.alert("오류", "로그인 정보가 없습니다.");
      }
    } catch (err) {
      Alert.alert("로그인 실패", err.message);
    }
  };
  const handleSignup = () => router.push("/login/SignupScreen");
  const handlePasswordReset = () => router.push("/login/PasswordResetScreen");

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      // 1) 카카오 SDK 로그인 → accessToken 획득
      const kakaoResult = await KakaoLogin.login();
      const accessToken = kakaoResult.accessToken;

      // 2) 서버에 카카오 accessToken 보내어 Firebase customToken 발급 요청
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (!response.ok) throw new Error("서버 토큰 발급 실패");
      const { token: firebaseToken } = await response.json();

      // 3) Firebase Auth에 커스텀 토큰으로 로그인
      const auth = getAuthInstance();
      await signInWithCustomToken(auth, firebaseToken);

      // 4) 로그인된 사용자 정보(uid) 가져오기
      const user = auth.currentUser;
      if (!user) throw new Error("로그인된 사용자를 찾을 수 없습니다.");
      const uid = user.uid; // 예: "kakao_4272322626"

      // 5) Firestore에서 users/{uid} 문서 존재 여부 확인
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 🔥 계정이 존재하지 않으면 → 프로필 문서 및 서브컬렉션 생성

        // 5-1) Firestore에 유저 프로필 문서 생성
        await setDoc(
          userRef,
          {
            name: "",                // 필요 시 따로 업데이트
            phoneNumber: phoneNumber, // 로그인 화면 입력값(예시)
            isAdmin: false,
            role: "",
            createdAt: serverTimestamp()
          },
          { merge: true }
        );

        // 5-2) Firestore에 서브컬렉션 account_kakao 생성
        await setDoc(
          doc(db, "users", uid, "account_kakao", uid),
          {
            kakaoKey: accessToken,
            linkedAt: serverTimestamp()
          },
          { merge: true }
        );

        // 5-3) Firestore에 서브컬렉션 account_local 빈 문서 생성 (추후 업데이트용)
        await setDoc(
          doc(db, "users", uid, "account_local", uid),
          {
            localId: "",
            passwordHash: "",
            createdAt: serverTimestamp()
          },
          { merge: true }
        );

        // 5-4) Firestore에 샘플용 locations 서브컬렉션 문서 생성 (예시: 빈 좌표 또는 기본값)
        await addDoc(collection(db, "users", uid, "locations"), {
          latitude: 0,
          longitude: 0,
          timestamp: serverTimestamp()
        });
      }

      // 6) 프로필 및 서브컬렉션 생성 여부에 상관없이, RoleSelectionScreen 으로 이동
      Alert.alert("로그인 성공");
      router.replace("/RoleSelectionScreen");
    } catch (err) {
      Alert.alert("로그인 실패", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Icon name="shopping-cart" size={32} style={styles.logoIcon} />
          <Text style={styles.logoText}>
            <Text style={styles.logoTextBlack}>효자</Text>
            <Text style={styles.logoTextGreen}>발</Text>
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>전화번호와 비밀번호를 입력하세요</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="전화번호 입력란"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="비밀번호 입력란"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or connect with social media</Text>

            <TouchableOpacity
              style={styles.kakaoButton}
              onPress={handleKakaoLogin}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.kakaoButtonText}>
                  💬 카카오 로그인
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePasswordReset}>
              <Text style={styles.linkText}>비밀번호 재설정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </SafeAreaView>
  );
}
