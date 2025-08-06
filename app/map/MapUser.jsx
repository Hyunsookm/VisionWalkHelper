// MapScreen.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';

// 내보내신 config에서 가져오기
import {
  getAuthInstance,
  db,
  signInAnonymously,
  onAuthStateChanged
} from '../../firebase/firebaseConfig';

import {
  collection,
  addDoc,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';

const FIREBASE_UPDATE_INTERVAL = 1 * 10 * 1000; // 1분 10초

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);
  const firebaseInterval = useRef(null);

  // firebaseConfig.js에서 만든 Auth 인스턴스
  const auth = getAuthInstance();

  useEffect(() => {
    // (선택) 로그인 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log('[DEBUG] auth state changed →', user);
    });

    // 1) 위치 트래킹 초기화
    initLocationTracking();

    return () => {
      unsubscribe();
      locationSubscription.current?.remove();
      clearInterval(firebaseInterval.current);
    };
  }, []);

  // 위치 권한, 초기 위치, watchPositionAsync 세팅
  const initLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 거부', '위치 권한이 없으면 지도를 사용할 수 없습니다.');
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    console.log('bye');
    handleLocationUpdate(coords);
    console.log('bye2');
    startFirebaseInterval(coords);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 3000,
      },
      pos => handleLocationUpdate(pos.coords)
    );

  };

  const handleLocationUpdate = useCallback(({ latitude, longitude }) => {
    const newLoc = { lat: latitude, lng: longitude };
    setLocation(newLoc);
    mapRef.current?.animateCameraTo({
      center: newLoc,
      zoom: 16,
      animation: true,
    });
  }, []);

  const startFirebaseInterval = useCallback(
    ({ latitude, longitude }) => {
      updateLocationToFirebase(latitude, longitude);
      firebaseInterval.current = setInterval(() => {
        if (location) {
          updateLocationToFirebase(location.lat, location.lng);
          saveLocationHistory(location.lat, location.lng);
        }
      }, FIREBASE_UPDATE_INTERVAL);
    },
    [location]
  );

  // Firestore 'locations'에 저장
  async function updateLocationToFirebase(lat, lng) {

    const user = auth.currentUser;

    if (!user) {
      console.warn('로그인 후 사용하세요.');
      return;
    }
    try {
      await addDoc(collection(db, 'locations'), {
        uid: user.uid,
        location: new GeoPoint(lat, lng),
        time: serverTimestamp()
      });
      console.log('✅ 위치 업데이트 성공');
    } catch (err) {
      console.error('❌ 위치 업데이트 실패:', err);
    }
  }

  // history용 콜렉션에 저장
  async function saveLocationHistory(lat, lng) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, 'locationHistory'), {
        uid: user.uid,
        latitude: lat,
        longitude: lng,
        timestamp: serverTimestamp()
      });
      console.log('✅ 위치 히스토리 저장');
    } catch (err) {
      console.error('❌ 위치 히스토리 저장 실패:', err);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        center={{ lat: 37.5665, lng: 126.9780, zoom: 10 }}
        showsMyLocationButton
        showsUserLocation
      />

      {location && (
        <View style={{
          position: 'absolute', top: 50, left: 20, right: 20,
          backgroundColor: 'rgba(255,255,255,0.9)', padding: 10,
          borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>📍 현재 위치</Text>
          <Text style={{ fontSize: 14, marginTop: 5 }}>
            위도: {location.lat.toFixed(6)}
          </Text>
          <Text style={{ fontSize: 14 }}>
            경도: {location.lng.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}