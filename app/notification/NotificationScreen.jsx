import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getAuthInstance, db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { styles } from "../styles/notificationStyles";

export default function NotificationsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'user' or 'guardian'

    // 알림 데이터 가져오기
    const fetchAlerts = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
        const auth = getAuthInstance();
        const currentUser = auth.currentUser;

        if (!currentUser) {
        Alert.alert("오류", "로그인이 필요합니다.");
        router.replace("/login/LoginScreen");
        return;
        }

        const uid = currentUser.uid;

        // 사용자 역할 확인
        const userRef = doc(db, "users", uid);
        const userSnap = await (await import("firebase/firestore")).getDoc(userRef);
        const role = userSnap.exists() ? userSnap.data()?.role : null;
        setUserRole(role);

        let q;

        // 역할에 따라 다른 쿼리 실행
        if (role === "사용자") {
            q = query(
                collection(db, "alerts"),
                where("userUid", "==", uid),
                orderBy("createdAt", "desc"),
                limit(50)
        );
        } 
        else if (role === "보호자") {
            q = query(
                collection(db, "alerts"),
                where("guardianUids", "array-contains", uid),
                orderBy("createdAt", "desc"),
                limit(50)
        );
        } 
        else {
            setAlerts([]);
            setLoading(false);
            return;
        }

        const snapshot = await getDocs(q);

        // deleted 아닌 알림만 필터링 (클라이언트 측에서)
        const alertsList = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((alert) => alert.status !== "deleted");

        setAlerts(alertsList);

    } catch (error) {
        console.error("알림 불러오기 실패:", error);
        Alert.alert("오류", "알림을 불러오는데 실패했습니다.");
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
    };


  useEffect(() => {
    fetchAlerts();
  }, []);

  // 새로고침
  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts(false);
  };

  // 알림 읽음 처리
  const markAsRead = async (alertId) => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      await updateDoc(alertRef, {
        status: "read",
      });
      // 로컬 상태 업데이트
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: "read" } : alert
        )
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // 알림 삭제
  const deleteAlert = async (alertId) => {
    try {
      const alertRef = doc(db, "alerts", alertId);
      await updateDoc(alertRef, {
        status: "deleted",
      });
      // 로컬 상태에서 제거
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      Alert.alert("삭제 완료", "알림이 삭제되었습니다.");
    } catch (error) {
      console.error("알림 삭제 실패:", error);
      Alert.alert("오류", "알림 삭제에 실패했습니다.");
    }
  };

  // 알림 타입에 따른 아이콘 반환
  const getAlertIcon = (type) => {
    switch (type) {
      case "fall":
        return "alert-triangle";
      case "battery":
        return "battery";
      case "location":
        return "map-pin";
      default:
        return "bell";
    }
  };

  // 알림 타입에 따른 색상 반환
  const getAlertColor = (type) => {
    switch (type) {
      case "fall":
        return "#ef4444"; // 빨강 (위험)
      case "battery":
        return "#f59e0b"; // 주황 (경고)
      case "location":
        return "#3b82f6"; // 파랑 (정보)
      default:
        return "#6b7280"; // 회색
    }
  };

  // 알림 타입에 따른 제목 반환
  const getAlertTitle = (type) => {
    switch (type) {
      case "fall":
        return "🚨 낙상 감지";
      case "battery":
        return "🔋 배터리 부족";
      case "location":
        return "📍 위치 알림";
      default:
        return "📢 알림";
    }
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    let date;
    if (typeof timestamp?.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 알림 상세 보기
  const handleAlertPress = async (alert) => {
    // 읽지 않은 알림이면 읽음 처리
    if (alert.status === "new") {
      await markAsRead(alert.id);
    }
    // 알림 타입에 따라 다른 화면으로 이동
    if (alert.type === "fall" && userRole === "보호자") {
      // 보호자는 해당 사용자의 위치 화면으로 이동
      router.push({
        pathname: "/map/MapGuardian",
        params: {
          userUid: alert.userUid,
          displayName: "사용자",
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>알림을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 알림 목록 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptyText}>
              새로운 알림이 도착하면 여기에 표시됩니다.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                alert.status === "new" && styles.unreadAlert,
              ]}
              onPress={() => handleAlertPress(alert)}
              activeOpacity={0.7}
            >
              <View style={styles.alertIcon}>
                <Feather
                  name={getAlertIcon(alert.type)}
                  size={24}
                  color={getAlertColor(alert.type)}
                />
              </View>

              <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>
                    {getAlertTitle(alert.type)}
                  </Text>
                  {alert.status === "new" && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.alertMessage} numberOfLines={2}>
                  {alert.type === "fall"
                    ? "보호 대상자에게서 낙상이 감지되었습니다."
                    : alert.message || "새로운 알림이 있습니다."}
                </Text>

                <View style={styles.alertFooter}>
                  <Text style={styles.alertTime}>
                    {formatTime(alert.createdAt)}
                  </Text>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert(
                        "알림 삭제",
                        "이 알림을 삭제하시겠습니까?",
                        [
                          { text: "취소", style: "cancel" },
                          {
                            text: "삭제",
                            style: "destructive",
                            onPress: () => deleteAlert(alert.id),
                          },
                        ]
                      );
                    }}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}