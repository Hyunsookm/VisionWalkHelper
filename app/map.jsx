import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);
  const mapRef = useRef(null);

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

        // 현재 위치 한 번 가져오기
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const currentLocation = { lat: latitude, lng: longitude };

            setLocation(currentLocation);
            setLoading(false);


            // 실시간 위치 추적 시작
            const id = Geolocation.watchPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { lat: latitude, lng: longitude };
                console.log('🔄 위치 업데이트:', newLocation);
                setLocation(newLocation);
              },
              (error) => {
                console.error('위치 추적 오류:', error);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
                distanceFilter: 5 // 5미터 이상 움직일 때만 업데이트
              }
            );
            setWatchId(id);
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

    // 컴포넌트 언마운트 시 위치 추적 중지
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

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
        ref={mapRef}
        style={{ flex: 1 }}
        center={{ ...location, zoom: 16 }}
        showsMyLocationButton={true}

      />

      {/* 위치 정보 오버레이 */}
      <View style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
          📍 현재 위치
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>
          위도: {location.lat.toFixed(6)}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          경도: {location.lng.toFixed(6)}
        </Text>
      </View>
    </View>
  );
}