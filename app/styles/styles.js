import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoIcon: {
    marginBottom: 8,
    color: "#000",
  },
  logoText: {
    fontSize: 24,
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
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  buttonGroup: {
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
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
