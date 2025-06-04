import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, Platform, PermissionsAndroid } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const locationSubscription = useRef(null); // expo-location용
  const watchIdRef = useRef(null);           // geolocation-service용

  const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780, zoom: 10 };

  useEffect(() => {
    const initAndroid = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 거부', '위치 권한이 없으면 지도를 사용할 수 없습니다.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(currentLocation);

      mapRef.current?.setCamera({
        center: currentLocation,
        zoom: 16,
        animation: true,
      });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (pos) => {
          const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLocation);
          mapRef.current?.setCamera({ center: newLocation, zoom: 16, animation: true });
        }
      );
    };

    const initIOS = async () => {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth !== 'granted') {
        Alert.alert('권한 거부', '위치 권한이 없으면 지도를 사용할 수 없습니다.');
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          setLocation(currentLocation);

          if (mapRef.current && mapRef.current.setCamera) {
            mapRef.current.setCamera({
              center: currentLocation,
              zoom: 16,
              animation: true,
            });
          }


          watchIdRef.current = Geolocation.watchPosition(
            (pos) => {
              const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setLocation(newLocation);
              mapRef.current?.setCamera({ center: newLocation, zoom: 16, animation: true });
            },
            (error) => {
              console.error('위치 추적 오류:', error);
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 5,
              interval: 3000,
              fastestInterval: 2000,
            }
          );
        },
        (error) => {
          console.error('현재 위치 가져오기 오류:', error);
          Alert.alert('위치 오류', '현재 위치 정보를 가져올 수 없습니다.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    if (Platform.OS === 'android') {
      initAndroid();
    } else if (Platform.OS === 'ios') {
      initIOS();
    }

    return () => {
      // Android
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      // iOS
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        center={DEFAULT_CENTER}
        fabric={false}
        showsMyLocationButton={true}
        showsUserLocation={true}
      />

      {location && (
        <View
          style={{
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
          }}
        >
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
      )}
    </View>
  );
}
