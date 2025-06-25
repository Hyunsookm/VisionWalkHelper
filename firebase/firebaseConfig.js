// firebase/firebaseConfig.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';    // ← Firestore import

// Firebase 웹 앱 구성
const firebaseConfig = {
  apiKey: "AIzaSyA0vVLFo-26proW2whe5NlJCmvO6emlGj8",
  authDomain: "visionwalkhelper.firebaseapp.com",
  projectId: "visionwalkhelper",
  storageBucket: "visionwalkhelper.firebasestorage.app",
  messagingSenderId: "759107664620",
  appId: "1:759107664620:web:7bc8de9a59fe9be0a403c9",
  measurementId: "G-NBX7XZJK29"
};

// 앱 중복 초기화 방지
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// React Native 전용 Auth 초기화
let _auth = null;
export function getAuthInstance() {
  if (!_auth) {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return _auth;
}

// ✅ Firestore 인스턴스 초기화
export const db = getFirestore(app);

export { onAuthStateChanged, signInAnonymously };