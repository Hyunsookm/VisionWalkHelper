// app/map/MapScreen.jsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import Constants from 'expo-constants';
import locationUpdater from '../../locationupdater';

export default function MapScreen() {
  const mapRef = useRef(null);
  const lastGeocodedRef = useRef({ lat: null, lng: null });

  const [location, setLocation] = useState(locationUpdater.getLastLocation() || null);
  const [address, setAddress] = useState('');
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [addrErr, setAddrErr] = useState('');

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

  // 좌표 변경 시 역지오코딩으로 주소 표시
  useEffect(() => {
    const run = async () => {
      if (!location?.lat || !location?.lng) return;

      const same =
        lastGeocodedRef.current.lat === location.lat &&
        lastGeocodedRef.current.lng === location.lng;
      if (same) return;

      setLoadingAddr(true);
      setAddrErr('');
      try {
        const text = await fetchNaverAddress(location.lat, location.lng);
        if (text) {
          setAddress(text);
          lastGeocodedRef.current = { lat: location.lat, lng: location.lng };
        } else {
          setAddress('');
          setAddrErr('주소를 불러올 수 없습니다.');
        }
      } catch {
        setAddress('');
        setAddrErr('네트워크 오류로 주소를 불러오지 못했습니다.');
      } finally {
        setLoadingAddr(false);
      }
    };
    run();
  }, [location?.lat, location?.lng]);

  const initialCenter = location
    ? { lat: location.lat, lng: location.lng, zoom: 16 }
    : { lat: 37.5665, lng: 126.9780, zoom: 10 };

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView
        showsMyLocationButton={true}
        showsUserLocation={true}
        ref={mapRef}
        style={{ flex: 1 }}
        center={initialCenter}
        showsMyLocationButton={true}
        showsUserLocation={true}
      />

      <View
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: 12,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>📍 현재 위치</Text>

        {loadingAddr ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <ActivityIndicator size="small" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14 }}>주소 불러오는 중...</Text>
          </View>
        ) : address ? (
          <Text style={{ fontSize: 14, marginTop: 6 }}>{address}</Text>
        ) : (
          <Text style={{ fontSize: 14, marginTop: 6, color: '#6b7280' }}>
            {addrErr || (location ? '주소 정보 없음' : '위치 수신 대기 중')}
          </Text>
        )}
      </View>
    </View>
  );
}

/* ================= 유틸 ================= */

async function fetchNaverAddress(lat, lng) {
  try {
    const ID =
      Constants.expoConfig?.extra?.NAVER_API_KEY_ID ||
      Constants.manifest?.extra?.NAVER_API_KEY_ID;
    const KEY =
      Constants.expoConfig?.extra?.NAVER_API_KEY ||
      Constants.manifest?.extra?.NAVER_API_KEY;

    if (!ID || !KEY) return null;

    // 네이버 역지오코딩은 coords=lng,lat 순서
    const url =
      'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc' +
      `?coords=${encodeURIComponent(lng)},${encodeURIComponent(lat)}` +
      '&output=json&orders=legalcode,admcode,addr,roadaddr&lang=ko';

    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': ID,
        'X-NCP-APIGW-API-KEY': KEY,
      },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) return null;

    // "시/도 시/군/구 읍/면/동 리" 형식으로 조립
    const toFullAddress = (r) => {
      const siDo = r?.region?.area1?.name || '';
      const si = r?.region?.area2?.name || '';
      const gu = r?.region?.area3?.name || '';
      const dong = r?.region?.area4?.name || '';
      const parts = [siDo, si, gu, dong].filter(Boolean);
      return parts.join(' ').trim() || null;
    };

    return (
      toFullAddress(results.find((r) => r.name === 'legalcode')) ||
      toFullAddress(results.find((r) => r.name === 'admcode')) ||
      toFullAddress(results.find((r) => r.name === 'addr')) ||
      toFullAddress(results.find((r) => r.name === 'roadaddr')) ||
      null
    );
  } catch {
    return null;
  }
}