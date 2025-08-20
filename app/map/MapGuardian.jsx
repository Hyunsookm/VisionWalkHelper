// app/map/MapGuardian.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from "@mj-studio/react-native-naver-map";

// 🔑 app.json → expo.extra에서 키 읽기 (expo SDK 버전 차이 대비)
const EXTRA =
  Constants.expoConfig?.extra ||
  Constants.manifest?.extra ||
  {};
const KEY_ID = EXTRA.NAVER_API_KEY_ID;
const KEY = EXTRA.NAVER_API_KEY;

console.log('KEY ok?', !!KEY_ID, !!KEY);
export default function MapGuardian() {
  const router = useRouter();
  const { userUid, displayName } = useLocalSearchParams();

  const [targetLoc, setTargetLoc] = useState(null);   // { latitude, longitude }
  const [camera, setCamera] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    zoom: 12,
  });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [address, setAddress] = useState("");         // "시 동"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");                 // 오류/안내 메시지

  const name = (displayName || userUid || "").toString();

  // ── 단발 조회 + 주소 변환 함수 ───────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!userUid) {
      setMsg("오류: userUid가 없습니다.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const ref = doc(db, "user_locations", String(userUid));
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setMsg("위치 데이터가 없습니다.");
        setTargetLoc(null);
        setAddress("");
        return;
      }

      const data = snap.data();
      const loc = parseLocation(data.location);
      if (!loc) {
        setMsg("위치 데이터 형식을 해석할 수 없습니다.");
        setTargetLoc(null);
        setAddress("");
        return;
      }

      setTargetLoc(loc);
      setUpdatedAt(parseTime(data.time));
      setCamera({ ...loc, zoom: 16 });

      // 좌표 → 한글 주소(시 동)
      const addr = await fetchNaverAddress(loc.latitude, loc.longitude);
      setAddress(addr || "");
      if (!addr) setMsg("주소를 불러올 수 없습니다.");
    } catch (e) {
      console.error("위치/주소 조회 실패:", e);
      setMsg("네트워크 또는 권한 문제로 위치를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>👤 {name}</Text>

          {/* 🔄 새로고침 버튼 */}
          <TouchableOpacity
            onPress={refresh}
            disabled={loading}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: loading ? "#9ca3af" : "#10b981",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {loading ? "불러오는 중…" : "새로고침"}
            </Text>
          </TouchableOpacity>
        </View>

        {targetLoc ? (
          <>
            <Text style={{ marginTop: 6 }}>
              📍 {address || (loading ? "주소 불러오는 중..." : "주소 없음")}
            </Text>
            <Text style={{ marginTop: 2, color: "#6b7280" }}>
              업데이트: {fmtTime(updatedAt)}
            </Text>
          </>
        ) : (
          <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
            {loading && <ActivityIndicator size="small" style={{ marginRight: 8 }} />}
            <Text style={{ color: "#6b7280" }}>
              {msg || "위치 데이터를 불러오는 중..."}
            </Text>
          </View>
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

/* ================= 유틸 ================= */

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
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function fmtTime(d) {
  if (!d) return "-";
  return d.toLocaleString("ko-KR", { hour12: false });
}

// ▽ 네이버 Reverse Geocoding: “시 동”만 반환 (lang=ko, coords=lng,lat)
// ▽ 네이버 Reverse Geocoding: "시 동" 우선, 실패 시 적절히 대체
// coords=lng,lat 순서 주의!
// ▽ 네이버 Reverse Geocoding: "시/도 시/군/구 동" 형식으로 반환
async function fetchNaverAddress(lat, lng) {
  try {
    const ID = Constants.expoConfig?.extra?.NAVER_API_KEY_ID;
    const KEY = Constants.expoConfig?.extra?.NAVER_API_KEY;
    if (!ID || !KEY) return null;

    const url =
      "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc" +
      `?coords=${encodeURIComponent(lng)},${encodeURIComponent(lat)}` +
      "&output=json&orders=legalcode,admcode,addr,roadaddr&lang=ko";

    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": ID,
        "X-NCP-APIGW-API-KEY": KEY,
      },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    if (!results.length) return null;

    // 포맷 함수: area1(경기도) + area2(용인시) + area3(수지구/읍/면/동) + area4(리)
    const toFullAddress = (r) => {
      const siDo = r?.region?.area1?.name || "";   // 경기도
      const si   = r?.region?.area2?.name || "";   // 용인시
      const gu   = r?.region?.area3?.name || "";   // 수지구 / 죽전동
      const dong = r?.region?.area4?.name || "";   // 죽전동 / 리
      const parts = [siDo, si, gu, dong].filter(Boolean);
      return parts.join(" ").trim() || null;
    };

    return (
      toFullAddress(results.find(r => r.name === "legalcode")) ||
      toFullAddress(results.find(r => r.name === "admcode")) ||
      toFullAddress(results.find(r => r.name === "addr")) ||
      toFullAddress(results.find(r => r.name === "roadaddr")) ||
      null
    );
  } catch (e) {
    return null;
  }
}