// guardianStyles.js
// 통합 스타일: 기존 키 호환 + 새 키 추가(안전 병합)

import { StyleSheet } from 'react-native';

// ───────────────────────── 공통 베이스 ─────────────────────────
const baseHeaderButton = { width: 32, alignItems: 'center' };

const basePrimaryButton = {
  backgroundColor: '#22c55e',
  borderRadius: 8,
  paddingVertical: 16,
  alignItems: 'center',
};

const basePrimaryButtonText = {
  color: '#fff',
  fontSize: 18,
  fontWeight: '500',
};

const baseAvatar = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#000',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
};

const baseBackdrop = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
};

const baseModalBox = {
  width: '100%',
  maxWidth: 320,
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 24,
};

// 새 모달 버튼(확인용) – confirmBtn과는 살짝 다름(마진/플렉스)
const baseModalButton = {
  backgroundColor: '#22c55e',
  paddingVertical: 12,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 8,
};

export const styles = StyleSheet.create({
  // ───────────────────────── 컨테이너/세이프에어리어 ─────────────────────────
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, backgroundColor: '#f9fafb' }, // 기존 유지
  containerWhite: { flex: 1, backgroundColor: '#fff' }, // 새 요구사항 대응

  scrollView: {
    flex: 1, // 헤더와 하단 네비게이션을 제외한 모든 남은 공간을 차지
  },

   // ───────────────────────── 헤더 ─────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // 16 → 20
    paddingVertical: 20, // 16 → 20
    borderBottomWidth: 2, // 1 → 2 (더 명확한 구분선)
    borderBottomColor: '#d1d5db', // #e5e7eb → #d1d5db (더 진한 회색)
    backgroundColor: '#fff',
    height: 72, // 56 → 72
  },
  headerBtn: baseHeaderButton,
  headerButton: baseHeaderButton,
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22, // 18 → 22
    fontWeight: '700', // 600 → 700
    color: '#111827',
  },

  // ───────────────────────── 콘텐츠/섹션 ─────────────────────────
  content: {
    padding: 28, // 24 → 28
    paddingBottom: 48, // 40 → 48
  },
  sectionTitle: { 
    fontSize: 20, // 16 → 20
    fontWeight: '700', // 600 → 700
    marginBottom: 16, // 12 → 16
    color: '#111827',
  },
  emptyText: { 
    color: "#6b7280", // #9ca3af → #6b7280 (더 진한 회색)
    fontSize: 16, // 13 → 16
    lineHeight: 24, // 18 → 24
    marginBottom: 16, // 12 → 16
  },

  // 행 형태(설정/리스트 셀)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // 16 → 20
    paddingVertical: 20, // 16 → 20
    borderBottomWidth: 2, // 1 → 2
    borderBottomColor: '#e5e7eb',
    minHeight: 68, // 최소 높이 보장
  },
  rowText: { 
    fontSize: 20, // 18 → 20
    fontWeight: '600', // 500 → 600
    color: '#111827',
  },

  // ───────────────────────── 유저 카드/목록 ─────────────────────────
  userList: { marginBottom: 28 }, // 24 → 28
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 12, // 8 → 12
    padding: 20, // 16 → 20
    marginBottom: 20, // 16 → 20
    minHeight: 88, // 최소 높이
    borderWidth: 2, // 경계선 추가
    borderColor: '#a7f3d0', // 연한 녹색 테두리
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: baseAvatar,
  userAvatar: baseAvatar,
  userName: { 
    fontSize: 22, // 18 → 22
    fontWeight: '600',
    color: '#111827',
  },

  // ───────────────────────── 기본 버튼(추가/연결) ─────────────────────────
  primaryButton: basePrimaryButton,
  primaryButtonText: basePrimaryButtonText,
  linkButton: {
    width: "100%",
    minHeight: 60, // 52 → 60
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16, // 12 → 16
    shadowColor: "#000",
    shadowOpacity: 0.15, // 0.12 → 0.15
    shadowRadius: 8, // 6 → 8
    shadowOffset: { width: 0, height: 4 },
    elevation: 4, // 2 → 4
  },
  linkButtonText: { 
    color: "#fff", 
    fontSize: 20, // 16 → 20
    fontWeight: "700", 
    letterSpacing: 0.5,
  },
  addButton: basePrimaryButton,
  addButtonText: basePrimaryButtonText,

  // ───────────────────────── 모달 ─────────────────────────
  backdrop: baseBackdrop,
  modalBackdrop: baseBackdrop,
  modalBox: baseModalBox,
  modalContent: baseModalBox,
  modalTitle: { 
    fontSize: 22, // 18 → 22
    fontWeight: '700', // 600 → 700
    marginBottom: 16, // 12 → 16
    color: '#111827',
  },
  modalTitleLg: { 
    fontSize: 24, // 20 → 24
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  modalMessage: { 
    fontSize: 18, // 16 → 18
    marginBottom: 28, // 24 → 28
    textAlign: 'center',
    lineHeight: 26,
    color: '#374151',
  },
  modalText: {
    fontSize: 17, // 14 → 17
    color: '#374151', // #4B5563 → #374151 (더 진하게)
    textAlign: 'center',
    marginBottom: 12, // 8 → 12
    lineHeight: 24, // 20 → 24
  },
  modalClose: { alignItems: 'flex-end' },
  modalBody: { marginVertical: 20, alignItems: 'center' },
  codeInput: {
    width: '100%',
    borderWidth: 2, // 1 → 2
    borderColor: '#d1d5db',
    borderRadius: 10, // 6 → 10
    padding: 16, // 8 → 16
    marginBottom: 20,
    fontSize: 18,
    minHeight: 52,
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },

  // 확인/취소/연결해제 버튼
  confirmBtn: {
    flex: 1,
    paddingVertical: 16, // 12 → 16
    borderRadius: 10, // 6 → 10
    alignItems: 'center',
    backgroundColor: '#22c55e',
    minHeight: 52,
  },
  confirmBtnText: { 
    fontSize: 18, // 16 → 18
    fontWeight: '700', // 500 → 700
    color: '#fff',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#dc2626',
    minHeight: 52,
  },
  cancelText: { 
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  unlinkBtn: {
    flex: 1,
    minHeight: 52, // 40 → 52
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#dc2626',
    marginTop: 16,
  },
  unlinkBtnText: { 
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // 새 모달 버튼(별도 키)
  modalButton: baseModalButton,
  modalButtonText: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '700',
  },

  // ───────────────────────── 하단 내비 ─────────────────────────
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 2, // 1 → 2
    borderTopColor: '#d1d5db',
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, // 8 → 12
    minHeight: 64,
  },
  activeNavItem: { 
    backgroundColor: '#f3f4f6', 
    borderRadius: 12,
  },
  navIcon: { marginBottom: 6 },
  navText: { 
    fontSize: 14, // 12 → 14
    color: '#6b7280',
    fontWeight: '500',
  },
  navTextActive: { 
    color: '#000000',
    fontWeight: '700',
  },
});

export default styles;
