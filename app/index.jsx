// app/index.jsx
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { getAuthInstance, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { locationUpdater } from '../locationupdater';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();

    // 전역 위치업데이터 초기화 (앱 생애주기 1회)
    locationUpdater.init({ auth, db });
    // 기본은 전송 차단, 구독도 시작하지 않음 (BLE 연결 시에만 시작)
    locationUpdater.setSendAllowed(false);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      (async () => {
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            const role = snap.exists() ? snap.data()?.role ?? null : null;

            if (role === 'user') {
              router.replace('/map/MapUser');
            } else if (role === 'guardian') {
              router.replace('/guardian/HomeScreen');
            } else {
              router.replace('/RoleSelectionScreen');
            }
          } catch (e) {
            console.warn('role check error:', e);
            router.replace('/RoleSelectionScreen');
          }
        } else {
          // 로그아웃 상태 → 완전 중지
          locationUpdater.setSendAllowed(false);
          locationUpdater.stop().catch(() => {});
          router.replace('/login/LoginScreen');
        }
        setLoading(false);
      })();
    });

    return () => {
      unsubscribe();
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

  return null;
}