import { useRouter } from "expo-router";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function GuardianScreen() {
  const router = useRouter();

  const handleUser1 = () => {
    router.push("/map/map");
  }

  const handleUser2 = () => {
    Alert.alert("알림", "사용자 2의 상세 정보를 확인합니다.")
  }

  const handleAddUser = () => {
    Alert.alert("알림", "새 사용자 연결 페이지로 이동합니다.")
  }

  const handleLocationNav = () => {
    router.push("/guardian/GuardianScreen")
  }

  const handleAccountNav = () => {
    router.push("/guardian/AccountLinkScreen")
  }

  const handleSettingsNav = () => {
    router.push("/guardian/GuardianSettingsScreen")
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>보호자</Text>
        <TouchableOpacity>
          <Icon name="bell" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* User List */}
        <View style={styles.userList}>
          <TouchableOpacity style={styles.userCard} onPress={handleUser1}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Icon name="user" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>사용자 1</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.userCard} onPress={handleUser2}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Icon name="user" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>사용자 2</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Add User Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <Text style={styles.addButtonText}>새 사용자 연결</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={handleLocationNav}>
          <Icon name="shopping-cart" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>위치 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleAccountNav}>
          <Icon name="user" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>계정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettingsNav}>
          <Icon name="settings" size={24} style={styles.navIcon} />
          <Text style={styles.navText}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
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
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
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
