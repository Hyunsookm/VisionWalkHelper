// app/map/MapGuardian.jsx
"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";

// ✅ (추가) 한글 주소 상태
const KEY_ID = process.env.EXPO_PUBLIC_NAVER_API_KEY_ID;
const KEY = process.env.EXPO_PUBLIC_NAVER_API_KEY;

export default function MapGuardian() {
  const router = useRouter();
  const { userUid, displayName } = useLocalSearchParams();

  const [targetLoc, setTargetLoc] = useState(null); // { latitude, longitude }
  const [camera, setCamera] = useState({
    latitude: 37.5665, // 기본: 서울
    longitude: 126.9780,
    zoom: 12,
  });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [address, setAddress] = useState(""); // ✅ (추가)

  const name = (displayName || userUid || "").toString();

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const ref = doc(db, "user_locations", String(userUid));
        const snap = await getDoc(ref);

        if (!isActive) return;

        if (!snap.exists()) {
          Alert.alert("위치 없음", "해당 사용자의 위치 데이터가 없습니다.");
          return;
        }

        const data = snap.data();
        const loc = parseLocation(data.location);
        if (!loc) {
          Alert.alert("오류", "위치 데이터 형식을 해석할 수 없습니다.");
          return;
        }

        setTargetLoc(loc);
        setUpdatedAt(parseTime(data.time));
        setCamera({ ...loc, zoom: 16 });

        // ✅ 좌표 → 한글 주소(네이버 Reverse Geocoding)
        const addr = await fetchNaverAddress(loc.latitude, loc.longitude);
        if (isActive) setAddress(addr);
      } catch (e) {
        if (isActive) {
          Alert.alert("오류", "사용자 위치를 불러오지 못했습니다.");
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [userUid]);

  return (
    <View style={{ flex: 1 }}>
      <NaverMapView style={{ flex: 1 }} camera={camera}>
        {targetLoc && (
          <NaverMapMarkerOverlay
            latitude={targetLoc.latitude}
            longitude={targetLoc.longitude}
            caption={{ text: name }}
          />
        )}
      </NaverMapView>

      {/* 상단 카드 */}
      <View
        style={{
          position: "absolute",
          top: 40,
          left: 16,
          right: 16,
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>👤 {name}</Text>
        {targetLoc ? (
          <>
            {/* ✅ 위도/경도 대신 한글 주소 */}
            <Text style={{ marginTop: 6 }}>📍 {address || "주소 불러오는 중..."}</Text>

            <Text style={{ marginTop: 2, color: "#6b7280" }}>
              업데이트: {fmtTime(updatedAt)}
            </Text>
          </>
        ) : (
          <Text style={{ marginTop: 6, color: "#6b7280" }}>
            위치 데이터를 불러오는 중...
          </Text>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 10,
            backgroundColor: "#111827",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            alignSelf: "flex-end",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>뒤로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --------- 유틸 함수들 ---------
function parseLocation(raw) {
  if (!raw) return null;
  if (raw.latitude != null && raw.longitude != null) {
    return { latitude: Number(raw.latitude), longitude: Number(raw.longitude) };
  }
  if (raw.lat != null && raw.lng != null) {
    return { latitude: Number(raw.lat), longitude: Number(raw.lng) };
  }
  if (Array.isArray(raw) && raw.length >= 2) {
    return { latitude: Number(raw[0]), longitude: Number(raw[1]) };
  }
  if (typeof raw === "string") {
    const [lat, lng] = raw.split(",").map((s) => parseFloat(s));
    if (!isNaN(lat) && !isNaN(lng)) return { latitude: lat, longitude: lng };
  }
  return null;
}

function parseTime(raw) {
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate();
  if (typeof raw === "number") return new Date(raw);
  return new Date(raw);
}

function fmtTime(d) {
  if (!d) return "-";
  return d.toLocaleString("ko-KR", { hour12: false });
}

// ✅ 네이버 Reverse Geocoding: 시/구/동까지 반환
async function fetchNaverAddress(lat, lng) {
  try {
    if (!KEY_ID || !KEY) return "네이버 API 키가 설정되지 않았습니다";

    // 네이버 API는 coords=경도,위도 순서! (lng,lat)
    const url =
      `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc` +
      `?coords=${encodeURIComponent(lng)},${encodeURIComponent(lat)}` +
      `&orders=legalcode` +   // 행정구역 코드(시/구/동)
      `&output=json&lang=ko`;

    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": KEY_ID,
        "X-NCP-APIGW-API-KEY": KEY,
      },
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return `주소 조회 실패(${res.status}) ${t}`;
    }

    const data = await res.json();

    // results[0].region.area1/2/3 => 시/구/동
    const item = data?.results?.[0];
    const r = item?.region;
    const si = r?.area1?.name || "";
    const gu = r?.area2?.name || "";
    const dong = r?.area3?.name || "";

    // 기본: "시 구 동"까지
    let text = `${si} ${gu} ${dong}`.trim();

    // 🔁 만약 "시 동"까지만 원하면 아래 한 줄로 교체
    // text = `${si} ${dong}`.trim();

    return text || "주소 없음";
  } catch (e) {
    console.log("fetchNaverAddress error:", e);
    return "주소 불러오기 실패";
  }
}