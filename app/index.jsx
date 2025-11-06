import { useRouter } from 'expo-router';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { getAuthInstance, db } from '../firebase/firebaseConfig';
import locationUpdater from '../locationupdater';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();
    locationUpdater.init({ auth, db });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try { await signInAnonymously(auth); } catch (e) {}
        return;
      }
      router.replace('/map/MapUser'); // 위치 업로드를 실제로 돌릴 화면
      setLoading(false);
    });

    return () => {
      unsubscribe();
      // 여기서 setSendAllowed(false)나 stop()을 호출하지 마세요.
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>앱을 준비 중입니다...</Text>
      </SafeAreaView>
    );
  }

  return null;
}