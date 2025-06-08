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
  writeLightByte,
  writeAlarmByte,
  writeVolumeByte,
} from "../../../utils/ble/bleConfigUtils";

export default function DeviceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const deviceId = params.deviceId; // { deviceId: "1234-..." }

  const [device, setDevice] = useState(null);
  const [isLightOn, setIsLightOn] = useState(false);
  const [alarmByte, setAlarmByte] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    if (!deviceId) {
      Alert.alert("오류", "deviceId가 없습니다.");
      return;
    }
    bleManager
      .devices([deviceId])
      .then((arr) => {
        if (arr.length > 0) {
          setDevice(arr[0]);
        } else {
          throw new Error("디바이스를 찾을 수 없습니다.");
        }
      })
      .catch((e) => Alert.alert("디바이스 로드 실패", e.message));
  }, [deviceId]);

  useEffect(() => {
    if (!device) return;
    (async () => {
      try {
        const lightVal = await readLightByte(device);
        setIsLightOn(lightVal === 1);

        const alarmVal = await readAlarmByte(device);
        setAlarmByte(alarmVal);

        const volVal = await readVolumeByte(device);
        setVolumeLevel(volVal);
      } catch (e) {
        Alert.alert("읽기 오류", e.message);
      }
    })();
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

  const onChangeAlarm = async () => {
    if (!device) return;
    try {
      const nextAlarm = (alarmByte + 1) & 0xff;
      await writeAlarmByte(device, nextAlarm);
      setAlarmByte(nextAlarm);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기기 상세 설정</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>연결 상태</Text>
            <Text style={styles.settingSubtitle}>
              {device ? "연결됨" : "연결 대기 중"}
            </Text>
            <Icon name="bluetooth" size={20} color={device ? "#3b82f6" : "#ccc"} />
          </View>
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
          <Text style={styles.settingTitle}>알람(Byte: {alarmByte})</Text>
          <TouchableOpacity style={styles.smallButton} onPress={onChangeAlarm}>
            <Text style={styles.smallButtonText}>+1 전송</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>볼륨(Byte: {volumeLevel})</Text>
          </View>
          <View style={styles.volumeControls}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => onChangeVolume(-10)}
            >
              <Text style={styles.smallButtonText}>-10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => onChangeVolume(10)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingTitle: { fontSize: 18, fontWeight: "500" },
  settingSubtitle: { fontSize: 14, color: "#666" },
  smallButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  smallButtonText: { color: "#fff", fontSize: 14 },
  volumeControls: { flexDirection: "row", gap: 8 },
  volumeButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  activeNavItem: { backgroundColor: "#f3f4f6", borderRadius: 8 },
  navIcon: { marginBottom: 4 },
  navText: { fontSize: 12 },
});
