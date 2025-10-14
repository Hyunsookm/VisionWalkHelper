// styles.js - 로그인 화면
// 노인층 친화 스타일: 큰 글씨, 큰 터치 영역, 높은 대비

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28, // 24 → 28
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40, // 32 → 40
  },
  logoIcon: {
    marginBottom: 12, // 8 → 12
    color: "#000",
  },
  logoText: {
    fontSize: 32, // 24 → 32
    fontWeight: "bold",
  },
  logoTextBlack: {
    color: "#000",
  },
  logoTextGreen: {
    color: "#22c55e",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24, // 20 → 24
    fontWeight: "700", // 600 → 700
    marginBottom: 6, // 4 → 6
    color: "#111827",
  },
  subtitle: {
    fontSize: 16, // 14 → 16
    color: "#4b5563", // #666 → #4b5563 (더 진하게)
    marginBottom: 28, // 24 → 28
  },
  inputGroup: {
    marginBottom: 20, // 16 → 20
  },
  label: {
    fontSize: 17, // 14 → 17
    fontWeight: "600", // 500 → 600
    marginBottom: 10, // 8 → 10
    color: "#111827",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2, // 1 → 2 (더 명확한 경계)
    borderColor: "#d1d5db", // #ccc → #d1d5db
    borderRadius: 10, // 8 → 10
    paddingHorizontal: 16, // 12 → 16
    backgroundColor: "#fff",
    minHeight: 56, // 최소 높이 보장
  },
  input: {
    flex: 1,
    height: 56, // 48 → 56
    fontSize: 18, // 16 → 18
    color: "#111827",
  },
  eyeIcon: {
    marginLeft: 12, // 8 → 12
    padding: 8, // 터치 영역 확대
  },
  buttonGroup: {
    marginTop: 20, // 16 → 20
  },
  loginButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18, // 14 → 18
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#3b82f6",
    fontSize: 14,
  },
  bottomIndicator: {
    alignItems: "center",
    paddingBottom: 16,
  },
  indicator: {
    width: 120,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
});

export default styles;
