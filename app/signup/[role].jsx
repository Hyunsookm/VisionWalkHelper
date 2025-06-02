import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

export default function Signup() {
  const { role } = useLocalSearchParams(); // 'user' 또는 'guardian'
  const router = useRouter();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('https://your-api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role, // 서버에 역할 전달
          name,
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('회원가입 완료', `${role === 'user' ? '사용자' : '보호자'}로 가입되었습니다.`);
        router.replace('/login');
      } else {
        Alert.alert('회원가입 실패', data.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      Alert.alert('에러', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === 'user' ? '👤 사용자' : '🧑‍⚕️ 보호자'} 회원가입
      </Text>

      <TextInput
        placeholder="이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="전화번호"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textcontentType="none"
        autoComplete="off"
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        textcontentType="none"
        autoComplete="off"
        style={styles.input}
      />

      <Button title="회원가입" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 20, marginBottom: 20 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});