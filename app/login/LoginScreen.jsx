"use client"

import * as KakaoLogin from "@react-native-seoul/kakao-login"
import { signInWithCustomToken } from "firebase/auth"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { getAuthInstance } from "../../firebase/firebaseConfig"
import styles from '../styles/styles'

const SERVER_URL = "http://172.30.1.73:3000/kakao-login"

import { useRouter } from 'expo-router'

export default function LoginScreen() {
  const router = useRouter(); {
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("010-1234-5678")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  

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
}


  const handleKakaoLogin = async () => {
    try {
      setLoading(true)
      const kakaoResult = await KakaoLogin.login()
      const accessToken = kakaoResult.accessToken

      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      })

      if (!response.ok) throw new Error("서버 토큰 발급 실패")

      const { token: firebaseToken } = await response.json()
      const auth = getAuthInstance()
      await signInWithCustomToken(auth, firebaseToken)

      Alert.alert("로그인 성공")
      router.replace("/RoleSelectionScreen")
    } catch (err) {
      Alert.alert("로그인 실패", err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = () => router.push("/login/SignupScreen")
  const handlePasswordReset = () => router.push("/login/PasswordResetScreen")

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
                placeholder="••••••••"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or connect with social media</Text>

            <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.kakaoButtonText}>💬 카카오 로그인</Text>
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
  )
}

}
