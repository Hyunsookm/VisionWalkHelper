// app/styles/userStyle.js
import { StyleSheet } from "react-native";

/**
 * 통합 팔레트 (필요 시 컴포넌트에서도 가져다 쓸 수 있게 export)
 */
export const COLORS = {
  bg: "#f9fafb",
  white: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  textSecondary: "#6b7280",
  primary: "#22c55e",   // 초록
  danger: "#ef4444",    // 빨강
  info: "#3b82f6",      // 파랑
  muted: "#f3f4f6",
  overlay: "rgba(0,0,0,0.5)",
};

export const styles = StyleSheet.create({
  // ───────────────────────── Layout / Container ─────────────────────────
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },

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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerButton: { width: 32, alignItems: "center" },
  // 호환용(일부 파일에서 headerBtn 사용)
  headerBtn: { width: 32, alignItems: "center" },

  // ───────────────────────── Text Blocks ─────────────────────────
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: COLORS.text },
  userName: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  emptyText: { color: COLORS.textSecondary, marginBottom: 16 },
  messageContainer: { marginBottom: 32 },
  messageText: { fontSize: 18, fontWeight: "500", textAlign: "center", lineHeight: 28, color: COLORS.text },

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
  // 공통
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

  smallButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  smallButtonText: { color: COLORS.white, fontSize: 14 },

  // 화면별 명시적 버튼 (기존 키와 매핑)
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

  linkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "500" },

  volumeControls: { flexDirection: "row", gap: 8 },
  volumeButton: {
    backgroundColor: COLORS.info,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  // ───────────────────────── Bottom Navigation ─────────────────────────
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  navIcon: { marginBottom: 4 },
  navText: { fontSize: 12, color: COLORS.textSecondary },
  navTextActive: { color: COLORS.primary },

  // 활성 아이템 (두 이름 모두 지원)
  navItemActive: { backgroundColor: COLORS.muted, borderRadius: 8 },
  activeNavItem: { backgroundColor: COLORS.muted, borderRadius: 8 },

  // ───────────────────────── Modals / Overlays ─────────────────────────
  // 배경(두 이름 모두 지원)
  modalBackdrop: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "center", alignItems: "center", padding: 16 },
  backdrop: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "center", alignItems: "center", padding: 16 },

  // 컨텐츠(두 이름 모두 지원)
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 24,
  },
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
