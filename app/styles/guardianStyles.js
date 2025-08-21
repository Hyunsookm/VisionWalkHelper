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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    height: 56, // 추가 반영
  },
  headerBtn: baseHeaderButton,
  headerButton: baseHeaderButton, // alias
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },

  // ───────────────────────── 콘텐츠/섹션 ─────────────────────────
  content: {
    padding: 24,
    paddingBottom: 40, // 하단바와 겹치지 않도록
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  emptyText: { color: "#9ca3af", fontSize: 13, lineHeight: 18, marginBottom: 12 },

  // 행 형태(설정/리스트 셀)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowText: { fontSize: 18, fontWeight: '500' },

  // ───────────────────────── 유저 카드/목록 ─────────────────────────
  userList: { marginBottom: 24 },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: baseAvatar,
  userAvatar: baseAvatar, // alias
  userName: { fontSize: 18 },

  // ───────────────────────── 기본 버튼(추가/연결) ─────────────────────────
  primaryButton: basePrimaryButton,
  primaryButtonText: basePrimaryButtonText,
  // 계정 연동 버튼: 구체적인 스타일로 업데이트
  linkButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  linkButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  addButton: basePrimaryButton, // alias
  addButtonText: basePrimaryButtonText, // alias

  // ───────────────────────── 모달 ─────────────────────────
  backdrop: baseBackdrop,
  modalBackdrop: baseBackdrop, // alias
  modalBox: baseModalBox,
  modalContent: baseModalBox, // alias
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 }, // 기존 유지
  modalTitleLg: { fontSize: 20, fontWeight: '600', marginBottom: 12 }, // 신규 옵션
  modalMessage: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalClose: { alignItems: 'flex-end' },
  modalBody: { marginVertical: 16, alignItems: 'center' },
  codeInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },

  // 확인/취소/연결해제 버튼
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#22c55e',
  },
  confirmBtnText: { fontSize: 16, fontWeight: '500', color: '#fff' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#dc2626',
  },
  cancelText: { color: '#fff' },
  unlinkBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#dc2626',
    marginTop: 12,
  },
  unlinkBtnText: { fontSize: 16, fontWeight: '500', color: '#fff' },

  // 새 모달 버튼(별도 키)
  modalButton: baseModalButton,
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  // ───────────────────────── 하단 내비 ─────────────────────────
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  activeNavItem: { backgroundColor: '#f3f4f6', borderRadius: 8 },
  navIcon: { marginBottom: 4 },
  navText: { fontSize: 12, color: '#6b7280' },
  navTextActive: { color: '#000000' },
});

export default styles;