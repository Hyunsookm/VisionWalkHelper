// app/_layout.js
// 노인층 친화: 큰 아이콘, 터치 영역 확대

import { Stack } from 'expo-router';
import { StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar
        translucent={false}
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: '700',
            color: '#111827',
          },
          headerStyle: {
            height: 72,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => Alert.alert('알림', '알림 목록을 봅니다.')}
              style={{ 
                marginRight: 15,
                padding: 8,
                minWidth: 48,
                minHeight: 48,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="bell" size={28} color="#000" />
            </TouchableOpacity>
          ),
        }}
      >
        {/* --- 인증 및 로딩 관련 화면 (헤더 숨김) --- */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="RoleSelectionScreen" options={{ headerShown: false }} />
        <Stack.Screen name="login/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login/SignInScreen" 
          options={{ 
            title: '회원가입', 
            headerRight: () => null 
          }} 
        />

        {/* --- 보호자 관련 화면 --- */}
        <Stack.Screen name="guardian/GuardianScreen" options={{ title: '위치 확인' }} />
        <Stack.Screen name="guardian/AccountLinkScreen" options={{ title: '연동 관리' }} />
        <Stack.Screen name="guardian/GuardianSettingsScreen" options={{ title: '설정' }} />

        {/* --- 지도 관련 화면 --- */}
        <Stack.Screen name="map/MapGuardian" options={{ title: '위치 확인 (보호자)' }} />
        <Stack.Screen name="map/MapUser" options={{ title: '위치 확인 (사용자)' }} />

        {/* --- 사용자 관련 화면 --- */}
        <Stack.Screen name="user/DeviceSettingsScreen" options={{ title: '기기 설정' }} />
        <Stack.Screen name="user/UserAccountScreen" options={{ title: '사용자 계정' }} />
        <Stack.Screen name="user/UserSettingsScreen" options={{ title: '설정' }} />
        
        {/* 동적 경로 화면 (예: 기기 상세 정보) */}
        <Stack.Screen name="user/[deviceId]/index" options={{ title: '기기 상세 설정' }} />
      </Stack>
    </SafeAreaProvider>
  );
}