// app/styles/userStyle.js
import { StyleSheet } from "react-native";

/**
 * 공통 팔레트
 */
export const COLORS = {
  bg: "#f9fafb",
  white: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  textSecondary: "#6b7280",
  primary: "#22c55e",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "#f3f4f6",
  overlay: "rgba(0,0,0,0.5)",
};

export const styles = StyleSheet.create({
  // ───────────────────────── Layout / Container ─────────────────────────
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },

  // ✅ 요청 블록의 content 형태로 업데이트 (패딩 24)
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },

  // 기존 가운데 정렬이 필요한 화면용으로 보존
  contentCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  contentPadded: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },

  // ✅ 요청 블록의 row/rowText
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowText: { fontSize: 18, fontWeight: "500", color: COLORS.text },

  // ───────────────────────── Header ─────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    height: 56,
  },
  // ✅ 요청 블록의 headerTitle 스펙 포함(폰트 18/600)
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerButton: { width: 32, alignItems: "center" },
  headerBtn: { width: 32, alignItems: "center" }, // 호환용

  // ───────────────────────── Text Blocks ─────────────────────────
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: COLORS.text },
  userName: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  emptyText: { color: COLORS.textSecondary, marginBottom: 16 },
  messageContainer: { marginBottom: 32 },
  messageText: { fontSize: 18, fontWeight: "500", textAlign: "center", lineHeight: 28, color: COLORS.text },

  // ✅ 요청 블록의 modalMessage (새로 추가)
  modalMessage: { fontSize: 16, marginBottom: 24, textAlign: "center", color: COLORS.text },

  // ───────────────────────── Cards / List Items ─────────────────────────
  profileSection: { marginBottom: 24 },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  // ───────────────────────── Settings Rows ─────────────────────────
  // ✅ 요청 블록 그대로 매핑
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingTitle: { fontSize: 18, fontWeight: "500", color: COLORS.text },
  settingSubtitle: { fontSize: 14, color: "#666" },

  // ───────────────────────── Buttons ─────────────────────────
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primaryButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  dangerButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  dangerButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  // ✅ 요청 블록의 smallButton/smallButtonText
  smallButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  smallButtonText: { color: COLORS.white, fontSize: 14 },

  linkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  // ✅ 요청 블록의 logoutButton/logoutButtonText
  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  // 화면별 명시적 버튼(기존 키와 매핑)
  connectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  connectButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },
  disconnectButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  disconnectButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "500" },

  // ✅ 요청 블록의 volumeControls/volumeButton
  volumeControls: { flexDirection: "row", gap: 8 },
  volumeButton: {
    backgroundColor: COLORS.info,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  // ───────────────────────── Bottom Navigation ─────────────────────────
  // ✅ 요청 블록의 bottomNav/navItem/activeNavItem/navIcon/navText
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  activeNavItem: { backgroundColor: COLORS.muted, borderRadius: 8 },
  navItemActive: { backgroundColor: COLORS.muted, borderRadius: 8 }, // 호환용
  navIcon: { marginBottom: 4 },
  navText: { fontSize: 12, color: COLORS.textSecondary },
  navTextActive: { color: COLORS.primary },

  // ───────────────────────── Modals / Overlays ─────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 24,
  },

  // 🔁 중복되던 modalBox는 한 번만 선언 (높이 제한 + 공간 배분)
  modalBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
    maxHeight: "85%",
  },

  modalClose: { alignItems: "flex-end" },
  closeButton: { position: "absolute", top: 10, right: 10, zIndex: 10, padding: 5 },
  closeButtonText: { fontSize: 20, fontWeight: "bold", color: "#999" },

  modalBody: { alignItems: "center", marginVertical: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: COLORS.text },
  modalText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  modalImage: { width: 100, height: 100, marginBottom: 12, backgroundColor: COLORS.border },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    gap: 8,
  },

  // 인증 코드 팝업 전용
  authCodeText: { fontSize: 28, fontWeight: "800", letterSpacing: 2, marginBottom: 6, color: COLORS.text },
  authTimer: { fontSize: 18, fontWeight: "600", color: COLORS.danger, marginBottom: 8 },
  authText: { fontSize: 14, color: "#4B5563", textAlign: "center" },
  codeInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 8,
    color: COLORS.text,
  },

  // 모달 버튼
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  modalButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "500" },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.white, textAlign: "center" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: COLORS.muted,
  },
  unlinkBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    alignSelf: "center",
  },
});

export default styles;