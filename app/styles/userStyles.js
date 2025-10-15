// app/styles/userStyle.js
// 노인층 친화 스타일: 큰 글씨, 큰 터치 영역, 높은 대비

import { StyleSheet } from "react-native";

/**
 * 공통 팔레트
 */
export const COLORS = {
  bg: "#f9fafb",
  white: "#ffffff",
  border: "#d1d5db", // #e5e7eb → #d1d5db (더 진하게)
  text: "#111827",
  textSecondary: "#4b5563", // #6b7280 → #4b5563 (더 진하게)
  primary: "#22c55e",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "#f3f4f6",
  overlay: "rgba(0,0,0,0.6)", // 0.5 → 0.6
};

export const styles = StyleSheet.create({
  // ───────────────────────── Layout / Container ─────────────────────────
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },

  content: { 
    flex: 1, 
    paddingHorizontal: 28, // 24 → 28
    paddingVertical: 28 
  },

  contentCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  contentPadded: { 
    flex: 1, 
    paddingHorizontal: 28, 
    paddingVertical: 28 
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20, // 16 → 20
    paddingVertical: 20, // 16 → 20
    borderBottomWidth: 2, // 1 → 2
    borderBottomColor: COLORS.border,
    minHeight: 68,
  },
  rowText: { 
    fontSize: 20, // 18 → 20
    fontWeight: "600", // 500 → 600
    color: COLORS.text 
  },

  // ───────────────────────── Header ─────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, // 16 → 20
    paddingVertical: 20, // 16 → 20
    borderBottomWidth: 2, // 1 → 2
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    height: 72, // 56 → 72
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22, // 18 → 22
    fontWeight: "700", // 600 → 700
    color: COLORS.text,
  },
  headerButton: { 
    width: 48, // 32 → 48
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  headerBtn: { 
    width: 48, 
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },

  // ───────────────────────── Text Blocks ─────────────────────────
  sectionTitle: { 
    fontSize: 20, // 16 → 20
    fontWeight: "700", // 600 → 700
    marginBottom: 16, // 12 → 16
    color: COLORS.text 
  },
  userName: { 
    fontSize: 28, // 24 → 28
    fontWeight: "700", 
    color: COLORS.text 
  },
  emptyText: { 
    color: COLORS.textSecondary, 
    fontSize: 16, // 기본 → 16
    marginBottom: 16 
  },
  messageContainer: { marginBottom: 32 },
  messageText: { 
    fontSize: 20, // 18 → 20
    fontWeight: "600", // 500 → 600
    textAlign: "center", 
    lineHeight: 30, // 28 → 30
    color: COLORS.text 
  },

  modalMessage: { 
    fontSize: 18, // 16 → 18
    marginBottom: 28, // 24 → 28
    textAlign: "center", 
    lineHeight: 26,
    color: COLORS.text 
  },

  // ───────────────────────── Cards / List Items ─────────────────────────
  profileSection: { marginBottom: 28 }, // 24 → 28
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: 12, // 8 → 12
    padding: 20, // 16 → 20
    marginBottom: 16, // 12 → 16
    minHeight: 88,
    borderWidth: 2,
    borderColor: "#a7f3d0",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 64, // 48 → 64
    height: 64,
    borderRadius: 32,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20, // 16 → 20
  },

  // ───────────────────────── Settings Rows ─────────────────────────
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20, // 16 → 20
    borderBottomWidth: 2, // 1 → 2
    borderBottomColor: COLORS.border,
    minHeight: 68,
  },
  settingLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 16 // 12 → 16
  },
  settingTitle: { 
    fontSize: 20, // 18 → 20
    fontWeight: "600", // 500 → 600
    color: COLORS.text 
  },
  settingSubtitle: { 
    fontSize: 16, // 14 → 16
    color: "#666" 
  },

  // ───────────────────────── Buttons ─────────────────────────
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12, // 8 → 12
    paddingVertical: 20, // 16 → 20
    paddingHorizontal: 28, // 24 → 28
    alignItems: "center",
    minHeight: 56,
  },
  primaryButtonText: { 
    color: COLORS.white, 
    fontSize: 20, // 18 → 20
    fontWeight: "700" // 500 → 700
  },

  dangerButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: "center",
    minHeight: 56,
  },
  dangerButtonText: { 
    color: COLORS.white, 
    fontSize: 20,
    fontWeight: "700"
  },

  smallButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10, // 6 → 10
    paddingHorizontal: 16, // 12 → 16
    borderRadius: 8, // 6 → 8
    minHeight: 44,
  },
  smallButtonText: { 
    color: COLORS.white, 
    fontSize: 16, // 14 → 16
    fontWeight: "600"
  },

  linkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    marginTop: 20, // 16 → 20
    minHeight: 60,
  },
  linkButtonText: { 
    color: COLORS.white, 
    fontSize: 20,
    fontWeight: "700"
  },

  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    marginTop: 16, // 12 → 16
    minHeight: 56,
  },
  logoutButtonText: { 
    color: COLORS.white, 
    fontSize: 20,
    fontWeight: "700"
  },

  connectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    marginBottom: 16, // 12 → 16
    minHeight: 56,
  },
  connectButtonText: { 
    color: COLORS.white, 
    fontSize: 20,
    fontWeight: "700"
  },
  disconnectButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 18, // 12 → 18
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    minHeight: 56,
  },
  disconnectButtonText: { 
    color: COLORS.white, 
    fontSize: 18, // 16 → 18
    fontWeight: "700" // 500 → 700
  },

  volumeControls: { 
    flexDirection: "row", 
    gap: 12 // 8 → 12
  },
  volumeButton: {
    backgroundColor: COLORS.info,
    paddingVertical: 10, // 6 → 10
    paddingHorizontal: 16, // 12 → 16
    borderRadius: 8,
    minHeight: 44,
  },

  // ───────────────────────── Bottom Navigation ─────────────────────────
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 2, // 1 → 2
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  navItem: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 12, // 8 → 12
    minHeight: 64,
  },
  activeNavItem: { 
    backgroundColor: COLORS.muted, 
    borderRadius: 12 // 8 → 12
  },
  navItemActive: { 
    backgroundColor: COLORS.muted, 
    borderRadius: 12 
  },
  navIcon: { marginBottom: 6 }, // 4 → 6
  navText: { 
    fontSize: 14, // 12 → 14
    color: COLORS.textSecondary,
    fontWeight: "500"
  },
  navTextActive: { 
    color: COLORS.primary,
    fontWeight: "700"
  },

  // ───────────────────────── Modals / Overlays ─────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24, // 16 → 24
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalContent: {
    width: "100%",
    maxWidth: 360, // 320 → 360
    backgroundColor: COLORS.white,
    borderRadius: 16, // 8 → 16
    padding: 32, // 24 → 32
  },

  modalBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "space-between",
    maxHeight: "85%",
  },

  modalClose: { alignItems: "flex-end" },
  closeButton: { 
    position: "absolute", 
    top: 12, // 10 → 12
    right: 12, 
    zIndex: 10, 
    padding: 8, // 5 → 8
    minWidth: 44,
    minHeight: 44,
  },
  closeButtonText: { 
    fontSize: 24, // 20 → 24
    fontWeight: "bold", 
    color: "#999" 
  },

  modalBody: { 
    alignItems: "center", 
    marginVertical: 20 // 16 → 20
  },
  modalTitle: { 
    fontSize: 22, // 18 → 22
    fontWeight: "700", // 600 → 700
    marginBottom: 16, // 12 → 16
    color: COLORS.text 
  },
  modalText: {
    fontSize: 17, // 14 → 17
    color: "#374151", // #4B5563 → #374151
    textAlign: "center",
    marginBottom: 12, // 8 → 12
    lineHeight: 24, // 20 → 24
  },
  modalImage: { 
    width: 120, // 100 → 120
    height: 120, 
    marginBottom: 16, // 12 → 16
    backgroundColor: COLORS.border 
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16, // 12 → 16
    gap: 12, // 8 → 12
  },

  // 인증 코드 팝업 전용
  authCodeText: { 
    fontSize: 32, // 28 → 32
    fontWeight: "800", 
    letterSpacing: 3, // 2 → 3
    marginBottom: 8, // 6 → 8
    color: COLORS.text 
  },
  authTimer: { 
    fontSize: 20, // 18 → 20
    fontWeight: "600", 
    color: COLORS.danger, 
    marginBottom: 12 // 8 → 12
  },
  authText: { 
    fontSize: 16, // 14 → 16
    color: "#4B5563", 
    textAlign: "center" 
  },
  codeInput: {
    width: "100%",
    borderWidth: 2, // 1 → 2
    borderColor: COLORS.border,
    borderRadius: 10, // 8 → 10
    paddingHorizontal: 16, // 12 → 16
    paddingVertical: 14, // 10 → 14
    fontSize: 18, // 16 → 18
    marginTop: 12, // 8 → 12
    color: COLORS.text,
    minHeight: 52,
  },

  // 모달 버튼
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16, // 12 → 16
    borderRadius: 10, // 6 → 10
    alignItems: "center",
    marginTop: 12, // 8 → 12
    minHeight: 52,
  },
  modalButtonText: { 
    color: COLORS.white, 
    fontSize: 18, // 16 → 18
    fontWeight: "700" // 500 → 700
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16, // 12 → 16
    borderRadius: 10, // 6 → 10
    alignItems: "center",
    backgroundColor: COLORS.primary,
    minHeight: 52,
  },
  confirmBtnText: { 
    fontSize: 18, // 16 → 18
    fontWeight: "700", // 600 → 700
    color: COLORS.white, 
    textAlign: "center" 
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: COLORS.muted,
    minHeight: 52,
  },
  unlinkBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 16, // 12 → 16
    paddingHorizontal: 28, // 24 → 28
    borderRadius: 12, // 8 → 12
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180, // 160 → 180
    alignSelf: "center",
    minHeight: 56,
  },
});

export default styles;