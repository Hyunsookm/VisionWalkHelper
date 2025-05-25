import React, { useEffect, useState } from 'react';
import { View, Text, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestPermissionAndGetLocation = async () => {
      try {
        if (Platform.OS === 'ios') {
          await Geolocation.requestAuthorization('whenInUse');
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('위치 권한이 거부되었습니다.');
            setLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 현재 위치:', latitude, longitude);
            setLocation({ lat: latitude, lng: longitude });
            setLoading(false);
          },
          (error) => {
            console.error('위치 오류:', error);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (err) {
        console.error('권한 또는 위치 오류:', err);
        setLoading(false);
      }
    };

    requestPermissionAndGetLocation();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>위치를 불러오는 중...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>위치를 가져올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        style={{ flex: 1 }}
        center={{ ...location, zoom: 16 }}
        showsMyLocationButton={true}  // 오른쪽 하단 내 위치 버튼
        isShowLocation={true}         // 지도에 파란 점 표시
        trackingMode="follow"         // 파란 점 + 자동 카메라 이동
      />
    </View>
  );
}