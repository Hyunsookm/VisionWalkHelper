// firebase/firebaseConfig.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
// import {
//   onAuthStateChanged,
//   signInAnonymously,
//   getAuth
// } from 'firebase/auth';
import {
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth/react-native';

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// ───────────────────────────────────────────────────────────
// 1. Firebase 웹 앱 구성
const firebaseConfig = {
  apiKey: "AIzaSyA0vVLFo-26proW2whe5NlJCmvO6emlGj8",
  authDomain: "visionwalkhelper.firebaseapp.com",
  projectId: "visionwalkhelper",
  storageBucket: "visionwalkhelper.firebasestorage.app",
  messagingSenderId: "759107664620",
  appId: "1:759107664620:web:7bc8de9a59fe9be0a403c9",
  measurementId: "G-NBX7XZJK29"
};
// ───────────────────────────────────────────────────────────

// 2. 앱 중복 초기화 방지
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ───────────────────────────────────────────────────────────
// 3. React Native 환경에 맞춘 Auth 초기화 (lazy)
let _auth = null;
export function getAuthInstance() {
  if (!_auth) {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return _auth;
}

// 4. Auth 객체 (익명 로그인·이벤트 감시용)
export const auth = getAuthInstance();

// ───────────────────────────────────────────────────────────
// 5. Firestore 초기화
export const db = getFirestore(app);

// ───────────────────────────────────────────────────────────
// 6. Firestore CRUD 함수

/**
 *  6-1) 사용자 프로필 생성 (서브컬렉션 없이 profiles 필드만 있는 문서)
 *  docId: 인증된 사용자 UID (예: Firebase Auth uid)
 *  profile: { name, phoneNumber, isAdmin, role }
 */
export async function createUserProfile(docId, profile) {
  const userRef = doc(db, "users", docId);
  await setDoc(
    userRef,
    {
      name: profile.name,
      phoneNumber: profile.phoneNumber,
      isAdmin: profile.isAdmin || false,
      role: profile.role || "사용자",
      createdAt: serverTimestamp()
    },
    { merge: true } // 문서가 이미 있으면 필드는 병합
  );
  return userRef.id;
}

/**
 *  6-2) 카카오 계정 정보 저장 (users/{userId}/account_kakao/{accountId})
 *  userId: users 컬렉션의 문서 ID
 *  kakaoKey: 카카오 연동 토큰 또는 키
 */
export async function setKakaoAccount(userId, kakaoKey) {
  const kakaoRef = doc(db, "users", userId, "account_kakao", userId);
  await setDoc(
    kakaoRef,
    {
      kakaoKey: kakaoKey,
      linkedAt: serverTimestamp()
    },
    { merge: true }
  );
  return kakaoRef.id;
}

/**
 *  6-3) 로컬 계정 정보 저장 (users/{userId}/account_local/{accountId})
 *  userId: users 컬렉션의 문서 ID
 *  localId: 로그인용 ID
 *  passwordHash: 해시된 비밀번호 문자열
 */
export async function setLocalAccount(userId, localId, passwordHash) {
  const localRef = doc(db, "users", userId, "account_local", userId);
  await setDoc(
    localRef,
    {
      localId: localId,
      passwordHash: passwordHash,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
  return localRef.id;
}

/**
 *  6-4) 위치 정보 추가 (users/{userId}/locations/{autoId})
 *  userId: users 컬렉션의 문서 ID
 *  latitude, longitude: 숫자형 좌표
 */
export async function addLocation(userId, latitude, longitude) {
  const locCollection = collection(db, "users", userId, "locations");
  const locDocRef = await addDoc(locCollection, {
    latitude,
    longitude,
    timestamp: serverTimestamp()
  });
  return locDocRef.id;
}

/**
 *  6-5) 피어 관계 생성 (peers 컬렉션에 추가)
 *  userId, peerId: users 컬렉션의 문서 ID들
 */
export async function addPeer(userId, peerId) {
  const peersCollection = collection(db, "peers");
  const peerDocRef = await addDoc(peersCollection, {
    userId,
    peerId,
    createdAt: serverTimestamp()
  });
  return peerDocRef.id;
}

/**
 *  6-6) 특정 사용자 프로필 조회 (users/{userId})
 */
export async function getUserProfile(userId) {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    throw new Error("해당 사용자가 존재하지 않습니다.");
  }
  return snapshot.data();
}

/**
 *  6-7) 특정 사용자의 최근 N개 위치 조회
 *  userId: users/{userId}
 *  limitCount: 반환할 최대 개수 (기본 5)
 */
export async function getRecentLocations(userId, limitCount = 5) {
  const locCollection = collection(db, "users", userId, "locations");
  // * 주의: Firestore Timestamp 객체를 정렬에 쓰려면 반드시 orderBy를 사용하세요.
  const locQuery = query(
    locCollection,
    where("timestamp", ">=", 0)
    // .orderBy("timestamp", "desc")  // 필요하다면 이 주석을 풀어 정렬하세요
  );
  const snapshot = await getDocs(locQuery);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .slice(0, limitCount);
}

/**
 *  6-8) 특정 사용자의 전체 피어 조회 (peers 컬렉션)
 */
export async function getPeersOfUser(userId) {
  const peersCollection = collection(db, "peers");
  const q = query(peersCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 *  6-9) 실시간 리스너 예시 (users/{userId}/locations)
 *  callback: (locationsArray) => { ... }
 *  return 값: 리스너 해제 함수
 */
export function listenToLocations(userId, callback) {
  const locCollection = collection(db, "users", userId, "locations");
  const locQuery = query(locCollection, /* .orderBy("timestamp") */);
  return onSnapshot(locQuery, (querySnapshot) => {
    const arr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(arr);
  });
}

// ───────────────────────────────────────────────────────────
// 7. 인증 상태 변경 감지 및 “자동 사용자 프로필” 생성
/**
 *  onAuthStateChanged를 통해 사용자가 로그인/로그아웃할 때마다 호출됩니다.
 *  - 로그인 상태가 감지되면, UID를 기반으로 users/{uid} 문서가 없으면 생성하도록 합니다.
 *  - { name: "", phoneNumber: "", isAdmin: false, role: "사용자" } 형태의 기본 프로필 예시를 만듭니다.
 *
 *  이 함수는 firebaseConfig.js가 로드될 때 자동으로 실행됩니다.
 */
// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const uid = user.uid;
//     try {
//       // 1) 사용자 문서가 이미 존재하는지 확인
//       const userRef = doc(db, "users", uid);
//       const userSnap = await getDoc(userRef);
//       if (!userSnap.exists()) {
//         // 2) 없다면 기본 프로필 문서 생성
//         await setDoc(userRef, {
//           name: "",           // 필요 시 초기값을 빈 문자열로 두거나,
//           phoneNumber: "",    // 이후 앱 화면에서 실제 정보를 입력받아 updateUserProfile() 호출
//           isAdmin: false,
//           role: "사용자",
//           createdAt: serverTimestamp()
//         });
//         console.log(`users/${uid} 문서를 자동으로 생성했습니다.`);
//       }
//       // 3) 추가로 서브컬렉션(예: account_kakao, account_local, locations)을 빈 상태로라도 초기화하고 싶다면?
//       //    아래 코드를 주석 해제하면, 최소한의 빈 서브컬렉션 구조를 미리 만들 수 있습니다.
//       //
//       await setDoc(doc(db, "users", uid, "account_kakao", uid), { kakaoKey: "" }, { merge: true });
//       await setDoc(doc(db, "users", uid, "account_local", uid), { localId: "", passwordHash: "" }, { merge: true });
//       await addDoc(collection(db, "users", uid, "locations"), { latitude: 0, longitude: 0, timestamp: serverTimestamp() });
      
//       // → 하지만 실제로는 “사용자 입력이 있을 때” 서브컬렉션을 만드는 편이 더 권장됩니다.
//     } catch (e) {
//       console.error("자동 프로필 생성 중 오류:", e);
//     }
//   } else {
//     console.log("사용자 로그아웃됨.");
//   }
// });


