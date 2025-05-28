import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { signInWithCustomToken } from 'firebase/auth';
import { Alert, Button, View } from 'react-native';
import { getAuthInstance } from '../../firebase/firebaseConfig';

const SERVER_URL = 'http://172.31.56.41:3000/kakao-login'; // ⚠️ 실제 서버 주소로 변경

export default function LoginScreen() {
  const login = async () => {
    try {
      // 1. 카카오 로그인
      const kakaoResult = await KakaoLogin.login();
      const accessToken = kakaoResult.accessToken;
      console.log("✅ Kakao 로그인 성공", accessToken);

      // 2. 서버에 accessToken 전송 → Firebase용 customToken 요청
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        throw new Error('서버에서 토큰을 받아오지 못했습니다.');
      }

      const { token: firebaseToken } = await response.json();

      // 3. Firebase 로그인
      const auth = getAuthInstance();
      await signInWithCustomToken(auth, firebaseToken);
      console.log('✅ Firebase 로그인 성공', firebaseToken);

      Alert.alert('로그인 성공');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      Alert.alert('로그인 실패', error.message || '알 수 없는 오류');
    }
    
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="카카오 로그인" onPress={login} color="#FEE500" />
    </View>
  );
}
