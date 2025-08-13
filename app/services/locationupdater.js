// app/services/locationUpdater.js
import * as Location from "expo-location";
import { GeoPoint, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppState } from "react-native";

const FIREBASE_UPDATE_INTERVAL = 20 * 1000; // 1분 10초 (너가 쓰던 값)
const WATCH_OPTIONS = {
  accuracy: Location.Accuracy.High,
  distanceInterval: 5,
  timeInterval: 3000,
};

class LocationUpdater {
  constructor() {
    this._started = false;
    this._auth = null;
    this._db = null;
    this._watchSub = null;
    this._intervalId = null;
    this._lastLoc = null;      // { lat, lng }
    this._lastSavedAt = 0;     // 마지막 업로드 시간(ms)
    this._listeners = new Set(); // 화면에서 현재 위치 구독용(optional)

    this._sendAllowed = false;

    this._handleAppState = this._handleAppState.bind(this);
  }

  init({ auth, db }) {
    this._auth = auth;
    this._db = db;
  }

  setSendAllowed(allowed) {
    this._sendAllowed = !!allowed;
  }

  async start() {
    if (this._started) return;
    if (!this._auth || !this._db) throw new Error("LocationUpdater not initialized");

    // 권한
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("위치 권한 거부됨");
      return;
    }

    // 초기 위치
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      this._setLoc(coords);
      await this._maybeSave(coords);
    } catch (e) {
      console.warn("초기 위치 조회 실패:", e);
    }

    // 실시간 추적
    this._watchSub = await Location.watchPositionAsync(WATCH_OPTIONS, async (pos) => {
      this._setLoc(pos.coords);
      await this._maybeSave(pos.coords);
    });

    // 주기 저장 타이머
    this._intervalId = setInterval(async () => {
      if (!this._lastLoc) return;
      if (!this._sendAllowed) return;
      await this._saveToFirestore(this._lastLoc.lat, this._lastLoc.lng);
    }, FIREBASE_UPDATE_INTERVAL);

    // 포그라운드/백그라운드 전환 시 정지/재개(원하면)
    AppState.addEventListener("change", this._handleAppState);
    this._started = true;
    console.log("[LocationUpdater] started");
  }

  async stop() {
    if (!this._started) return;
    this._watchSub?.remove?.();
    this._watchSub = null;
    clearInterval(this._intervalId);
    this._intervalId = null;
    AppState.removeEventListener?.("change", this._handleAppState);
    this._started = false;
    console.log("[LocationUpdater] stopped");
  }

  // 화면에서 현재 위치를 구독하고 싶을 때 사용 (옵션)
  subscribe(callback) {
    this._listeners.add(callback);
    if (this._lastLoc) callback(this._lastLoc);
    return () => this._listeners.delete(callback);
  }

  getLastLocation() {
    return this._lastLoc;
  }

  _notify() {
    for (const cb of this._listeners) cb(this._lastLoc);
  }

  _setLoc({ latitude, longitude }) {
    this._lastLoc = { lat: latitude, lng: longitude };
    this._notify();
  }

  async _maybeSave({ latitude, longitude }) {
    if (!this._sendAllowed) return;
    const now = Date.now();
    // watchPositionAsync로 너무 자주 올리지 않게 쿨다운
    if (now - this._lastSavedAt < 10 * 1000) return; // 최소 10초 간격
    await this._saveToFirestore(latitude, longitude);
  }

  async _saveToFirestore(lat, lng) {
    if (!this._sendAllowed) return;
    const user = this._auth.currentUser;
    if (!user) {
      console.warn("로그인이 필요합니다. 위치 저장 건너뜀");
      return;
    }
    try {
      await setDoc(
        doc(this._db, "user_locations", user.uid), // uid 문서 하나에 덮어쓰기
        {
          uid: user.uid,
          location: new GeoPoint(lat, lng),
          time: serverTimestamp(),
        },
        { merge: true }
      );
      this._lastSavedAt = Date.now();
      // (선택) 히스토리도 유지하려면 여기서 addDoc 호출 추가
      // await addDoc(collection(this._db, "locationHistory"), {...})
      // 단, 과도한 쓰기를 피하도록 주기/조건은 조절할 것
    } catch (e) {
      console.error("위치 저장 실패:", e);
    }
  }

  async _handleAppState(state) {
    // 요구사항: "백그라운드 말고, 앱이 켜져있을 때 상시"
    // active일 때만 작동하도록 제어 (원하면 유지, 원치 않으면 제거)
    if (state === "active" && !this._started) {
      await this.start();
    }
    if (state !== "active" && this._started) {
      // 앱이 백그라운드/비활성화되면 정지
      await this.stop();
    }
  }
}

export const locationUpdater = new LocationUpdater();