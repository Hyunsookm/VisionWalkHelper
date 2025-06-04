import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { getAuthInstance } from '../firebase/firebaseConfig';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/RoleSelectionScreen'); // 로그인된 상태 → 역할 선택 화면
      } else {
        router.replace('/login/LoginScreen'); // 로그인되지 않음 → 로그인 화면
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 16 }}>앱을 준비 중입니다...</Text>
      </SafeAreaView>
    );
  }

  return null; // 초기 로딩 후 router.replace로 이동하므로 실제 렌더링은 없음
}
