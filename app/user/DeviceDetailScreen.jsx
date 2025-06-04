"use client"

import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function DeviceDetailScreen() {
  const router = useRouter();
  const [isLightOn, setIsLightOn] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기기 설정</Text>
        <TouchableOpacity>
          <Icon name="bell" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>연결 상태</Text>
            <Text style={styles.settingSubtitle}>양호</Text>
            <Icon name="bluetooth" size={20} color="#3b82f6" />
          </View>
        </View>

        {/* Battery */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>배터리</Text>
          <View style={styles.batteryIcon}>
            <View style={styles.batteryBody}>
              <View style={styles.batteryLevel} />
            </View>
          </View>
        </View>

        {/* Alert Sound */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>경고음</Text>
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeLabel}>음량</Text>
              <View style={styles.volumeBar}>
                <View style={styles.volumeLevel} />
              </View>
              <Text style={styles.volumeValue}>99%</Text>
            </View>
          </View>
        </View>

        {/* Light Switch */}
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>전조등</Text>
          <Switch
            value={isLightOn}
            onValueChange={setIsLightOn}
            trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => router.push("/user/DeviceSettingsScreen")}
        >
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>기기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/user/UserAccountScreen")}>
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/SettingsScreen")}>
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  batteryIcon: {
    width: 48,
    height: 24,
    backgroundColor: "#000",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  batteryBody: {
    width: 32,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 2,
  },
  batteryLevel: {
    width: 24,
    height: 12,
    backgroundColor: "#000",
    borderRadius: 1,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  volumeLabel: {
    fontSize: 14,
    color: "#666",
  },
  volumeBar: {
    width: 80,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  volumeLevel: {
    width: 80,
    height: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  volumeValue: {
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  navIcon: {
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
  },
});