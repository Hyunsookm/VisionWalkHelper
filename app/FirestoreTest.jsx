import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig" // ⚠️ 경로는 프로젝트 구조에 따라 조정

export default function FirestoreTest() {
  const [status, setStatus] = useState("🔄 Firestore 연결 확인 중...")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const snap = await getDoc(doc(db, "test", "connection"))
        setStatus(`✅ 연결 성공 (문서 있음: ${snap.exists()})`)
      } catch (err) {
        console.error("❌ Firestore 연결 실패:", err.code, err.message)
        setStatus(`❌ Firestore 연결 실패: [${err.code}] ${err.message}`)
      }
    }

    checkConnection()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 16 }}>{status}</Text>
    </View>
  )
}