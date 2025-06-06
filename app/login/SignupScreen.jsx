import { useState } from "react"
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from "react-native"
import { useRouter } from "expo-router"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { getAuthInstance } from "../../firebase/firebaseConfig"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase/firebaseConfig"
import MobileFrame from "../../components/mobile-frame"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) newErrors.name = "이름을 입력해주세요."
    if (!phoneNumber.trim()) newErrors.phoneNumber = "전화번호를 입력해주세요."
    if (!password.trim()) newErrors.password = "비밀번호를 입력해주세요."
    else if (password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다."
    if (password !== confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    try {
      const auth = getAuthInstance()
      const email = `${phoneNumber.replace(/-/g, "")}@example.com` // 전화번호 → 이메일 변환

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", phoneNumber), {
        uid: userCredential.user.uid,
        name,
        phoneNumber,
        createdAt: new Date(),
      })

      alert("회원가입이 완료되었습니다!")
      router.push("/login")
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "이미 가입된 전화번호입니다.",
        }))
      } else {
        alert(`회원가입 실패: ${err.message}`)
      }
    }
  }

  const isFormValid =
    name.trim() && phoneNumber.trim() && password.trim() && confirmPassword.trim()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MobileFrame title="회원가입" showBackButton onBackClick={() => router.back()}>
          <View style={{ flex: 1, padding: 24 }}>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={{
                width: 64,
                height: 64,
                backgroundColor: "#3B82F6",
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12
              }}>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>효자발</Text>
              </View>
              <Text style={{ color: "#4B5563" }}>회원 정보를 입력하세요</Text>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChangeText={setName}
                  placeholder="홍길동"
                  style={errors.name ? { borderColor: "red" } : {}}
                  textContentType="name"
                />
                {errors.name && <Text style={{ color: "red", fontSize: 12 }}>{errors.name}</Text>}
              </View>

              <View>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="010-1234-5678"
                  style={errors.phoneNumber ? { borderColor: "red" } : {}}
                  textContentType="telephoneNumber"
                />
                {errors.phoneNumber && <Text style={{ color: "red", fontSize: 12 }}>{errors.phoneNumber}</Text>}
              </View>

              <View>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  secureTextEntry
                  textContentType="none"
                  autoComplete="off"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  style={errors.password ? { borderColor: "red" } : {}}
                />
                {errors.password && <Text style={{ color: "red", fontSize: 12 }}>{errors.password}</Text>}
              </View>

              <View>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  secureTextEntry
                  textContentType="none"
                  autoComplete="off"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  style={errors.confirmPassword ? { borderColor: "red" } : {}}
                />
                {errors.confirmPassword && <Text style={{ color: "red", fontSize: 12 }}>{errors.confirmPassword}</Text>}
              </View>

              <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 16 }}>
                계속 진행하면 이용 약관 및 개인정보 보호정책에 동의하게 됩니다.
              </Text>

              <Button onPress={handleSignup} disabled={!isFormValid}>
                회원가입
              </Button>
            </View>
          </View>
        </MobileFrame>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}