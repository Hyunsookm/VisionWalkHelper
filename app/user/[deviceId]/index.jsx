"use client";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import bleManager from "../../../utils/ble/bleManager"; // 경로 확인 필요
import {
  readLightByte,
  readAlarmByte,
  readVolumeByte,
  readBatteryByte,
  writeLightByte,
  writeAlarmByte,
  writeVolumeByte,
  subscribeToFallDetection,
} from "../../../utils/ble/bleConfigUtils"; // 경로 확인 필요
import { getAuthInstance, db } from "../../../firebase/firebaseConfig"; // 경로 확인 필요
import { collection, query, where, getDocs } from "firebase/firestore";
import { locationUpdater } from "../../../locationupdater"; // 경로 확인 필요
import { styles } from "../../styles/userStyles"; // 경로 확인 필요

export default function DeviceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.deviceId;

  const [device, setDevice] = useState(null);
  const [isLightOn, setIsLightOn] = useState(false);
  const [alarmByte, setAlarmByte] = useState(0);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const auth = getAuthInstance();

  // Guardian UID 가져오기
  async function resolveGuardianUids(userUid) {
    try {
      const q = query(
        collection(db, "peers"),
        where("userUid", "==", userUid),
        where("status", "==", "linked")
      );
      const snap = await getDocs(q);
      const uids = [];
      snap.forEach((d) => {
        const g = d.data()?.guardianUid;
        if (g) uids.push(g);
      });
      return Array.from(new Set(uids));
    } catch (e) {
      console.warn("resolveGuardianUids error:", e);
      return [];
    }
  }

  // 1. [핵심 수정] deviceId를 이용해 Device 객체 복구
  useEffect(() => {
    if (!deviceId) {
      Alert.alert("오류", "deviceId가 없습니다.");
      return;
    }

    const fetchDeviceObject = async () => {
      try {
        // 이미 연결되어 있다고 가정하고, 관리자에게 해당 ID의 기기 객체를 요청
        // react-native-ble-plx의 경우 devices([id]) 메서드 사용 가능
        const devices = await bleManager.devices([deviceId]);
        if (devices && devices.length > 0) {
          const deviceObj = devices[0];
          
          // 혹시 연결이 끊겨있을 수도 있으니 확인 (선택 사항)
          const isConnected = await deviceObj.isConnected();
          if (isConnected) {
            console.log("✅ Device 객체 확보 완료:", deviceObj.id);
            setDevice(deviceObj); // 여기서 state가 업데이트되어야 아래 로직들이 돕니다.
          } else {
            console.warn("⚠️ 기기가 연결되어 있지 않습니다. 재연결 시도...");
            await deviceObj.connect();
            await deviceObj.discoverAllServicesAndCharacteristics();
            setDevice(deviceObj);
          }
        } else {
          console.error("❌ 해당 ID의 기기를 찾을 수 없습니다 (Scan 필요 가능성).");
          Alert.alert("연결 오류", "기기 객체를 찾을 수 없습니다. 다시 연결해주세요.");
          router.back();
        }
      } catch (e) {
        console.error("❌ Device 객체 복구 실패:", e);
      }
    };

    fetchDeviceObject();
  }, [deviceId]);

  // 2. [기존 유지] 위치 업데이트 로직
  useEffect(() => {
    const onConnected = (evt) => {
      if (deviceId && evt?.deviceId && evt.deviceId !== deviceId) return;
      locationUpdater.setSendAllowed(true);
      locationUpdater.start({ immediate: true }).catch((e) => console.warn(e));
    };
    const onDisconnected = (evt) => {
      if (deviceId && evt?.deviceId && evt.deviceId !== deviceId) return;
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
    };
    const subConn = bleManager.on?.("connected", onConnected);
    const subDisc = bleManager.on?.("disconnected", onDisconnected);

    // 초기 상태 확인
    bleManager.isDeviceConnected(deviceId).then((connected) => {
        if(connected) onConnected({ deviceId });
    }).catch(()=>{});

    return () => {
      subConn?.remove?.();
      subDisc?.remove?.();
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
    };
  }, [deviceId]);

  // 3. [핵심 수정] Device 객체가 생기면 구독 및 초기값 읽기 실행
  useEffect(() => {
    if (!device) return; // device가 setDevice로 설정된 후에만 실행됨

    // (1) 배터리 구독
    const batterySubscription = readBatteryByte(device, setBatteryLevel);
    
    // (2) 낙상 감지 구독
    const fallSubscription = subscribeToFallDetection(device, auth, db, {
      guardianUidsResolver: resolveGuardianUids,
    });

    // (3) [추가됨] 초기 상태값(전조등, 알람, 볼륨) 한 번 읽어오기 (동기화)
    const syncInitialState = async () => {
        try {
            const lVal = await readLightByte(device);
            setIsLightOn(lVal === 1);

            const aVal = await readAlarmByte(device);
            setAlarmByte(aVal);
            setIsAlarmOn(aVal > 0);

            const vVal = await readVolumeByte(device);
            setVolumeLevel(vVal);
        } catch (err) {
            console.warn("⚠️ 초기 상태 동기화 중 일부 실패:", err.message);
        }
    };
    syncInitialState();

    return () => {
      batterySubscription?.remove?.();
      fallSubscription?.remove?.();
    };
  }, [device]); // device가 변경될 때 실행

  // ... (toggleLight, toggleAlarm, onChangeVolume, render 부분은 기존과 동일) ...
  
  const toggleLight = async (newVal) => {
    setIsLightOn(newVal);
    if (!device) return;
    try {
      await writeLightByte(device, newVal ? 1 : 0);
    } catch (e) {
      Alert.alert("쓰기 실패", e.message);
      // 실패 시 UI 원상복구
      setIsLightOn(!newVal);
    }
  };

  const toggleAlarm = async (newVal) => {
    setIsAlarmOn(newVal);
    if (!device) return;
    try {
      const byteVal = newVal ? 1 : 0;
      await writeAlarmByte(device, byteVal);
      setAlarmByte(byteVal);
    } catch (e) {
      Alert.alert("쓰기 실패", e.message);
      setIsAlarmOn(!newVal);
    }
  };

  const onChangeVolume = async (delta) => {
    if (!device) return;
    try {
      const nextVol = Math.min(255, Math.max(0, volumeLevel + delta));
      await writeVolumeByte(device, nextVol);
      setVolumeLevel(nextVol);
    } catch (e) {
      Alert.alert("쓰기 실패", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>연결 상태</Text>
            <Text style={styles.settingSubtitle}>
              {device ? "연결됨" : "연결 정보를 불러오는 중..."}
            </Text>
            <Icon name="bluetooth" size={20} style={{ marginLeft: 105 }} color={device ? "#3b82f6" : "#ccc"} />
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>배터리 레벨</Text>
          <Text style={styles.settingSubtitle}>
            {batteryLevel !== null ? `${batteryLevel}%` : "측정 중..."}
          </Text>
        </View>

        {/* ... 나머지 UI (전조등, 알람, 볼륨, 하단 네비게이션) 기존과 동일 ... */}
         <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>전조등</Text>
          <Switch
            value={isLightOn}
            onValueChange={toggleLight}
            trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>알람</Text>
          <Switch
            value={isAlarmOn}
            onValueChange={toggleAlarm}
            trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>볼륨</Text>
            <Text style= {styles.settingSubtitle}>           볼륨값: {volumeLevel}</Text>
          </View>
          <View style={styles.volumeControls}>
            <TouchableOpacity
              style={[styles.volumeButton, styles.decreaseButton]}
              onPress={() => onChangeVolume(-10)}
            >
              <Text style={styles.smallButtonText}>-10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => onChangeVolume(+10)}
            >
              <Text style={styles.smallButtonText}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
       <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>기기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/user/UserAccountScreen")}
        >
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/user/UserSettingsScreen")}
        >
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
