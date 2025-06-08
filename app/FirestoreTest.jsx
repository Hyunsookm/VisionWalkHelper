import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig"
import { useRouter } from "expo-router"
import Icon from "react-native-vector-icons/Feather"

export default function FirestoreTest() {
  const [status, setStatus] = useState("🔄 Firestore 연결 확인 중...")
  const router = useRouter()

  useEffect(() => {
    const testFirestore = async () => {
      try {
        const snap = await getDoc(doc(db, "users", "connection"))
        setStatus(`✅ 연결 성공 (문서 있음: ${snap.exists()})`)
      } catch (err) {
        console.log("❌ 연결 실패:", err.code, err.message)
        setStatus(`❌ 연결 실패: [${err.code}] ${err.message}`)
      }
    }

    testFirestore()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>{status}</Text>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#eee",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        }}
      >
        <Icon name="arrow-left" size={18} color="#333" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16, color: "#333" }}>뒤로가기</Text>
      </TouchableOpacity>
    </View>
  )
}