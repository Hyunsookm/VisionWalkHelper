// app/guardian/GuardianScreen.jsx

"use client";

import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { styles } from "../styles/guardianStyles";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // iOS: 배너/알림센터 노출
    shouldShowBanner: true,
    shouldShowList: true,
    // Android: 여전히 shouldShowAlert 플래그를 참고하므로 true로 유지
    shouldShowAlert: Platform.OS === "android",
    // 사운드/배지
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alerts", {
      name: "Alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export default function GuardianScreen() {
  const router = useRouter();
  const [linkedUsers, setLinkedUsers] = useState([]);
  const alertUnsubRef = useRef(null);
  const isInitialSnapshotRef = useRef(true);

  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
      await ensureAndroidChannel();
    })();
  }, []);

  useEffect(() => {
    const fetchLinked = async () => {
      try {
        const auth = getAuthInstance();
        const guardianUid = auth.currentUser?.uid;
        if (!guardianUid) return;

        const q = query(
          collection(db, "peers"),
          where("guardianUid", "==", guardianUid),
          where("status", "==", "linked")
        );
        const snap = await getDocs(q);
        const users = snap.docs.map(doc => ({
          code: doc.id,
          userUid: doc.data().userUid,
          guardianDisplayName: doc.data().guardianDisplayName || null,
        }));
        setLinkedUsers(users);
      } catch (e) {
        console.error("링크된 사용자 불러오기 실패:", e);
      }
    };
    fetchLinked();
  }, []);

  useEffect(() => {
    const startAlertsListener = async () => {
      const auth = getAuthInstance();
      const guardianUid = auth.currentUser?.uid;
      if (!guardianUid) return;

      if (alertUnsubRef.current) {
        alertUnsubRef.current();
        alertUnsubRef.current = null;
      }
      isInitialSnapshotRef.current = true;

      const qAlerts = query(
        collection(db, "alerts"),
        where("guardianUids", "array-contains", guardianUid),
        where("status", "==", "new")
      );

      alertUnsubRef.current = onSnapshot(
        qAlerts,
        async snapshot => {
          if (isInitialSnapshotRef.current) {
            isInitialSnapshotRef.current = false;
            return;
          }
          const added = snapshot.docChanges().filter(c => c.type === "added");
          for (const change of added) {
            const data = change.doc.data() || {};
            const title = data.type === "fall" ? "낙상 감지" : "알림";
            const body = "보호 대상자에게서 이상 신호가 감지되었습니다.";

            await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
                data: {
                  alertId: change.doc.id,
                  userUid: String(data.userUid || ""),
                  deviceId: String(data.deviceId || ""),
                  type: String(data.type || "alert"),
                  status: String(data.status || ""),
                },
              },
              trigger: null,
            });
          }
        },
        err => {
          console.warn("alerts 실시간 구독 에러:", err);
        }
      );
    };

    startAlertsListener();
    return () => {
      if (alertUnsubRef.current) {
        alertUnsubRef.current();
        alertUnsubRef.current = null;
      }
    };
  }, []);

  const handleOpenUser = (u) => {
    router.push({
      pathname: "/map/MapGuardian",
      params: {
        userUid: u.userUid,
        displayName: u.guardianDisplayName || u.userUid,
      },
    });
  };

  const handleAccountNav = () => {
    router.push("/guardian/AccountLinkScreen");
  };

  const handleSettingsNav = () => {
    router.push("/guardian/GuardianSettingsScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>보호자</Text>
        <TouchableOpacity onPress={() => Alert.alert("알림", "알림 화면으로 이동합니다.")}>
          <Icon name="bell" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>연동된 사용자</Text>

        {linkedUsers.length === 0 && (
          <Text style={styles.emptyText} allowFontScaling={false}>
            아직 연결된 사용자가 없습니다.
          </Text>
        )}

        {linkedUsers.map((u) => (
          <TouchableOpacity
            key={u.code}
            style={styles.userCard}
            onPress={() => handleOpenUser(u)}
            activeOpacity={0.8}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>
                {u.guardianDisplayName || u.userUid}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={handleAccountNav}>
          <Feather name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettingsNav}>
          <Feather name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}