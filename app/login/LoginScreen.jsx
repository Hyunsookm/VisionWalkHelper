import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { useRouter } from 'expo-router';
import { signInWithCustomToken } from 'firebase/auth';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAuthInstance } from '../../firebase/firebaseConfig';

const SERVER_URL = 'http://172.31.56.41:3000/kakao-login'; // 실제 서버 주소 사용

export default function LoginScreen() {
  const router = useRouter();

  const login = async () => {
    try {
      // 1. 카카오 로그인
      const kakaoResult = await KakaoLogin.login();
      const accessToken = kakaoResult.accessToken;
      console.log('✅ Kakao 로그인 성공', accessToken);

      // 2. 서버에 accessToken 전송 → Firebase Custom Token 받기
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        throw new Error('서버에서 토큰을 받아오지 못했습니다.');
      }

      const { token: firebaseToken } = await response.json();

      // 3. Firebase 인증
      const auth = getAuthInstance();
      await signInWithCustomToken(auth, firebaseToken);
      console.log('✅ Firebase 로그인 성공', firebaseToken);

      Alert.alert('로그인 성공');
      router.push('/'); // 홈으로 이동
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      Alert.alert('로그인 실패', error.message || '알 수 없는 오류');
    }
  };

  return (
    <View style={styles.container}>
      {/* 로고 및 타이틀 */}
      <View style={styles.logoWrapper}>
        <Text style={styles.logoText}>
          <Text style={{ color: 'black' }}>효자</Text>
          <Text style={{ color: 'green' }}>발</Text>
        </Text>
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity onPress={login} style={styles.kakaoButton}>
        <Text style={styles.kakaoText}>💬 카카오 로그인</Text>
      </TouchableOpacity>

      {/* 추가 링크 (회원가입, 비밀번호 재설정) */}
      <View style={styles.linkWrapper}>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/password-reset')}>
          <Text style={styles.link}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  logoWrapper: { marginBottom: 50 },
  logoText: { fontSize: 32, fontWeight: 'bold' },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  kakaoText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  linkWrapper: { flexDirection: 'row', marginTop: 20, gap: 30 },
  link: { color: '#666', fontSize: 14 },
});
