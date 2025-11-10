// app/styles/notificationStyles.js
import { StyleSheet } from "react-native";

export const COLORS = {
  bg: "#f9fafb",
  white: "#ffffff",
  border: "#d1d5db",
  text: "#111827",
  textSecondary: "#4b5563",
  primary: "#22c55e",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "#f3f4f6",
  overlay: "rgba(0,0,0,0.6)",
  warning: "#7ca0daff"
};

export const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.bg 
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // ───────── 헤더 ─────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    height: 64,
  },

  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  headerRight: {
    width: 48,
  },

  // ───────── 스크롤뷰 ─────────
  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  // ───────── 빈 상태 ─────────
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // ───────── 알림 카드 ─────────
  alertCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  unreadAlert: {
    backgroundColor: "#f0fdf4",  // primary 밝은 버전이므로 유지
    borderColor: "#86efac",
    borderWidth: 2,
  },

  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  alertContent: {
    flex: 1,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },

  newBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },

  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },

  alertMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },

  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  alertTime: {
    fontSize: 12,
    color: "#9ca3af", // 회색의 미묘한 밝기 차 때문에 유지 (너무 줄이면 대비 약해짐)
  },

  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
});

export default styles;
