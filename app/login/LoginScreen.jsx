// app/login/LoginScreen.jsx

"use client";

import * as KakaoLogin from "@react-native-seoul/kakao-login";
import { signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
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
import { useRouter } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import { useRef } from "react";

import styles from "../styles/styles";

const SERVER_URL = "https://visionwalkhelper.shop/kakao-login";

// 전화번호 자동 포맷 함수 (000-0000-0000)
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,4})(\d{0,4})$/);
  if (!match) return value;
  const [, part1, part2, part3] = match;
  if (part2) {
    if (part3) return `${part1}-${part2}-${part3}`;
    return `${part1}-${part2}`;
  }
  return part1;
};

export default function LoginScreen() {
  const router = useRouter();

  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 이메일/비밀번호 로그인
  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password) {
      return Alert.alert("입력 오류", "전화번호와 비밀번호를 모두 입력해주세요.");
    }
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const email = phoneNumber.replace(/[^0-9]/g, "") + "@visionwalkhelper.com";
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // -- Firestore에 프로필이 없으면 로그인 실패 처리 --
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        Alert.alert("로그인 실패", "존재하지 않는 계정입니다.");
        setLoading(false);
        return;
      }

      Alert.alert("로그인 성공");
      router.replace("/RoleSelectionScreen");
    } catch (err) {
      let message = err.message;
      if (err.code === "auth/user-not-found") {
        message = "등록되지 않은 전화번호입니다.";
      } else if (err.code === "auth/wrong-password") {
        message = "비밀번호가 틀렸습니다.";
      }
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      const kakaoResult = await KakaoLogin.login();
      const accessToken = kakaoResult.accessToken;
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (!response.ok) throw new Error("서버 토큰 발급 실패");
      const { token: firebaseToken } = await response.json();

      const auth = getAuthInstance();
      await signInWithCustomToken(auth, firebaseToken);
      const uid = auth.currentUser.uid;

      // Firestore 프로필 체크/생성
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: "",
          phoneNumber,
          isAdmin: false,
          role: "",
          createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "users", uid, "account_kakao", uid), {
          kakaoKey: accessToken,
          linkedAt: serverTimestamp()
        });
        await setDoc(doc(db, "users", uid, "account_local", uid), {
          localId: "",
          passwordHash: "",
          createdAt: serverTimestamp()
        });
        await addDoc(collection(db, "users", uid, "locations"), {
          latitude: 0,
          longitude: 0,
          timestamp: serverTimestamp()
        });
      }

      Alert.alert("카카오 로그인 성공");
      router.replace("/RoleSelectionScreen");
    } catch (err) {
      Alert.alert("로그인 실패", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 전화번호 변경 및 자동 포커스 이동
  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);

    // 순수 숫자만 남겨서 길이 체크 (010-1234-5678 -> "01012345678" 길이 11)
    const digitCount = formatted.replace(/\D/g, "").length;
    if (digitCount === 11) {
      passwordInputRef.current?.focus();
    }
  };

  const handleSignup = () => {
    router.push("/login/SignInScreen");
  };

  const handlePasswordReset = () => {
    router.push("/login/PasswordResetScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <Icon name="shopping-cart" size={32} style={styles.logoIcon} />
          <Text style={styles.logoText}>
            <Text style={styles.logoTextBlack}>효자</Text>
            <Text style={styles.logoTextGreen}>발</Text>
          </Text>
        </View>

         {/* 로그인 폼 */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>전화번호와 비밀번호를 입력하세요</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호</Text>
            <View style={styles.inputContainer}>
            <TextInput
              ref={phoneInputRef}
              style={styles.input}
              value={phoneNumber}
              onChangeText={handlePhoneChange}    // ← 여기 변경
              keyboardType="phone-pad"
              placeholder="전화번호 입력"
              maxLength={13}
              returnKeyType="next"
            />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={passwordInputRef}                           // ← ref 할당
                returnKeyType="done"                          // ← “다음” 버튼
                onSubmitEditing={handleLogin}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="비밀번호 입력"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(v => !v)}
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginButtonText}>로그인</Text>
              }
            </TouchableOpacity>

            <Text style={styles.orText}>소셜 계정으로 로그인하기</Text>

            <TouchableOpacity
              style={styles.kakaoButton}
              onPress={handleKakaoLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.kakaoButtonText}>💬 카카오 로그인</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.linkContainer}>
            <Text style={styles.orText}>아직 계정이 없으신가요? </Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </SafeAreaView>
  );
}