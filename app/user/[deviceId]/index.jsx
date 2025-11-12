"use client";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import bleManager from "../../../utils/ble/bleManager";
import {
  readLightByte,
  readAlarmByte,
  readVolumeByte,
  readBatteryByte,
  writeLightByte,
  writeAlarmByte,
  writeVolumeByte,
  subscribeToFallDetection,
} from "../../../utils/ble/bleConfigUtils";
import { getAuthInstance, db } from "../../../firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { locationUpdater } from "../../../locationupdater";
import { styles } from "../../styles/userStyles";

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

  useEffect(() => {
    if (!deviceId) {
      Alert.alert("오류", "deviceId가 없습니다.");
      return;
    }
  }, [deviceId]);

  // BLE 연결 상태에 따라 위치업데이트 시작/중지
  useEffect(() => {
    const onConnected = (evt) => {
      if (deviceId && evt?.deviceId && evt.deviceId !== deviceId) return;
      locationUpdater.setSendAllowed(true);
      locationUpdater.start({ immediate: true }).catch((e) => {
        console.warn("location start error:", e);
      });
    };

    const onDisconnected = (evt) => {
      if (deviceId && evt?.deviceId && evt.deviceId !== deviceId) return;
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
    };

    const subConn = bleManager.on?.("connected", onConnected);
    const subDisc = bleManager.on?.("disconnected", onDisconnected);

    try {
      if (bleManager.isConnected?.(deviceId)) {
        onConnected({ deviceId });
      }
    } catch {}

    return () => {
      subConn?.remove?.();
      subDisc?.remove?.();
      locationUpdater.setSendAllowed(false);
      locationUpdater.stop().catch(() => {});
    };
  }, [deviceId]);

  useEffect(() => {
    if (!device) return;

    const batterySubscription = readBatteryByte(device, setBatteryLevel);
    const fallSubscription = subscribeToFallDetection(device, auth, db, {
      guardianUidsResolver: resolveGuardianUids,
    });

    return () => {
      batterySubscription?.remove?.();
      fallSubscription?.remove?.();
    };
  }, [device]);

  const toggleLight = async (newVal) => {
    setIsLightOn(newVal);
    if (!device) return;
    try {
      await writeLightByte(device, newVal ? 1 : 0);
    } catch (e) {
      Alert.alert("쓰기 실패", e.message);
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
              {device ? "연결됨" : "연결 대기 중"}
            </Text>
            <Icon name="bluetooth" size={20} style={{ marginLeft: 105 }} color={device ? "#3b82f6" : "#ccc"} />
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>배터리 레벨</Text>
          <Text style={styles.settingSubtitle}>
            {batteryLevel !== null ? `${batteryLevel}%` : "읽는 중..."}
          </Text>
        </View>

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

const localStyles = StyleSheet.create({});