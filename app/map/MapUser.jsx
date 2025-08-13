// MapScreen.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import { locationUpdater } from "../services/locationupdater";

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
  GeoPoint,
  doc,
  setDoc,
} from 'firebase/firestore';

const FIREBASE_UPDATE_INTERVAL = 1 * 10 * 1000; // 1분 10초

export default function MapScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(locationUpdater.getLastLocation());

  useEffect(() => {
    // 전역 위치 구독
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

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        ref={mapRef}
        style={{ flex: 1 }}
        center={{ lat: 37.5665, lng: 126.9780, zoom: 10 }}
        showsMyLocationButton={true}
        showsUserLocation={true}

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