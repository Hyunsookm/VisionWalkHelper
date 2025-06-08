// app/login/SignupPage.jsx

"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/Feather";

export default function SignupPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!phoneNumber.trim() || !password) {
      return Alert.alert("입력 오류", "전화번호와 비밀번호를 모두 입력해주세요.");
    }
    if (password !== confirm) {
      return Alert.alert("비밀번호 오류", "비밀번호가 일치하지 않습니다.");
    }

    setLoading(true);
    try {
      const auth = getAuthInstance();
      // 전화번호 → 가짜 이메일
      const email = phoneNumber.replace(/[^0-9]/g, "") + "@visionwalkhelper.com";

      // 1) Firebase Auth에 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2) Firestore 프로필 문서 저장
      await setDoc(doc(db, "users", uid), {
        phoneNumber,
        createdAt: serverTimestamp(),
        isAdmin: false,
        role: "",
        name: ""
      });

      Alert.alert("회원가입 성공", "로그인 화면으로 이동합니다.");
      router.replace("/login/LoginScreen");
    } catch (err) {
      let message = err.message;
      if (err.code === "auth/email-already-in-use") {
        message = "이미 가입된 전화번호입니다.";
      } else if (err.code === "auth/weak-password") {
        message = "비밀번호는 최소 6자 이상이어야 합니다.";
      }
      Alert.alert("회원가입 실패", message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = phoneNumber.trim() && password && confirm;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.form}>
            <Text style={styles.title}>회원가입</Text>

            <View style={styles.inputGroup}>
              <Icon name="phone" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="전화번호 (숫자만)"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (6자 이상)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={!isFormValid || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>가입하기</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => router.replace("/login/LoginScreen")}
            >
              <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  form: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  inputGroup: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  icon: { marginRight: 8, color: "#666" },
  input: {
    flex: 1,
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: "#388E3C",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { backgroundColor: "#A5D6A7" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#388E3C", textDecorationLine: "underline" },
});