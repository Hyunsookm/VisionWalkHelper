// app/map/MapScreen.jsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import locationUpdater from '../../locationupdater';

export default function MapScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(locationUpdater.getLastLocation() || null);

  // 화면 진입 시 위치업데이트 시작, 이탈 시 중지
  useEffect(() => {
    locationUpdater.setSendAllowed(true);
    locationUpdater.start({ immediate: true }).catch(() => {});

    return () => {
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
    };
  }, []);

  // 전역 위치 구독 → 지도 카메라 이동
  useEffect(() => {
    const unsub = locationUpdater.subscribe((loc) => {
      setLocation(loc);
      mapRef.current?.animateCameraTo?.({
        center: { lat: loc.lat, lng: loc.lng },
        zoom: 16,
        animation: true,
      });
    });
    return unsub;
  }, []);

  const initialCenter = location
    ? { lat: location.lat, lng: location.lng, zoom: 16 }
    : { lat: 37.5665, lng: 126.9780, zoom: 10 };

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        center={initialCenter}
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
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
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