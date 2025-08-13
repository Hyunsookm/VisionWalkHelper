import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { getAuthInstance, db } from '../firebase/firebaseConfig';
import { locationUpdater } from './services/locationupdater';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

useEffect(() => {
  const auth = getAuthInstance();

  // 전역 위치업데이터 초기화 (앱 생애주기 1회)
  locationUpdater.init({ auth, db });
  // 기본은 전송 차단( BLE 연결되면 화면에서 true로 바꿔줌 )
  locationUpdater.setSendAllowed(false);

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // 앱이 active인 동안 위치 추적/주기 저장 로직을 켜두되,
      // _sendAllowed=false라 Firestore 업로드는 일단 막혀 있음.
      locationUpdater.start().catch((e) => console.warn("location start error:", e));
      router.replace("/RoleSelectionScreen");
    } else {
      // 로그아웃되면 업로드 차단 + 서비스 정지
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
      router.replace("/login/LoginScreen");
    }
    setLoading(false);
  });

  return () => {
    unsubscribe();
    // 안전 차단 후 정지
    locationUpdater.setSendAllowed(false);
    locationUpdater.stop().catch(() => {});
  };
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
