import { useRouter } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handleCardUser = () => {
    router.push("/user/DeviceSettingsScreen");
  };

  const handleGuardian = () => {
    router.push("/guardian/GuardianScreen");
  };

  const handleLogout = () => {
    router.replace("/login/LoginScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={48} color="#fff" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>로그인 성공~!</Text>
          <Text style={styles.subtitle}>사용자/보호자 중 역할을 선택하세요</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cardUserButton} onPress={handleCardUser}>
            <Text style={styles.buttonText}>카트 사용자</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guardianButton} onPress={handleGuardian}>
            <Text style={styles.buttonText}>보호자</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 32,
    width: 96,
    height: 96,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  cardUserButton: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 80,
  },
  guardianButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 80,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 48,
  },
  logoutText: {
    color: "#666",
    fontSize: 18,
  },
  bottomIndicator: {
    alignItems: "center",
    paddingBottom: 16,
  },
  indicator: {
    width: 128,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
});
