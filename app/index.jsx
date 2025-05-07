import { Link } from 'expo-router';
import { signInAnonymously } from 'firebase/auth/react-native';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { getAuthInstance } from '../firebase/firebaseConfig';

export default function HomeScreen() {
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const auth = getAuthInstance();                 // ← 여기서만 초기화
      const { user } = await signInAnonymously(auth); // ← auth 넘겨줌
      setUid(user.uid);
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🏠 홈 화면</Text>
      {uid ? <Text>UID: {uid}</Text> : null}
      {!uid && (
        <Button
          title={loading ? '로그인 중…' : '익명 로그인'}
          onPress={handleLogin}
          disabled={loading}
        />
      )}
      <Link href="/profile">
        <Text style={{ color: 'blue', marginTop: 20 }}>프로필로 이동</Text>
      </Link>
    </View>
  );
}
