// locationupdater.js (루트 또는 app/services 바깥 권장)
import * as Location from "expo-location";
import { GeoPoint, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppState } from "react-native";

const FIREBASE_UPDATE_INTERVAL = 10 * 1000;

class LocationUpdater {
  constructor() {
    this._started = false;
    this._auth = null;
    this._db = null;

    this._intervalId = null;
    this._lastLoc = null;
    this._listeners = new Set();
    this._sendAllowed = false;

    this._isActive = true;
    this._appStateSub = null;

    this._handleAppState = this._handleAppState.bind(this);
  }

  init({ auth, db }) {
    this._auth = auth;
    this._db = db;
    console.log("[LocationUpdater] init");
  }

  setSendAllowed(allowed) {
    this._sendAllowed = !!allowed;
    console.log("[LocationUpdater] sendAllowed =", this._sendAllowed);
  }

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

  async start({ immediate = true } = {}) {
    if (this._started) {
      console.log("[LocationUpdater] start() ignored: already started");
      return;
    }
    if (!this._auth || !this._db) throw new Error("LocationUpdater not initialized");

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("위치 권한 거부됨");
      return;
    }

    this._appStateSub = AppState.addEventListener("change", this._handleAppState);
    this._started = true;

    console.log(
      "[LocationUpdater] started (interval:",
      FIREBASE_UPDATE_INTERVAL / 1000,
      "s) | allowed:",
      this._sendAllowed,
      "| active:",
      this._isActive,
      "| loggedIn:",
      !!this._auth?.currentUser
    );

    if (immediate) {
      if (this._sendAllowed && this._isActive && this._auth?.currentUser) {
        await this._updateOnce();
      } else {
        console.log("[LocationUpdater] immediate skip ->",
          "allowed:", this._sendAllowed,
          "active:", this._isActive,
          "loggedIn:", !!this._auth?.currentUser
        );
      }
    }

    this._startInterval();
  }

  async stop() {
    if (!this._started) return;
    this._clearInterval();
    this._appStateSub?.remove?.();
    this._appStateSub = null;
    this._started = false;
    console.log("[LocationUpdater] stopped");
  }

  _startInterval() {
    this._clearInterval();
    this._intervalId = setInterval(async () => {
      if (!this._started) return;
      if (!this._sendAllowed) { console.log("[LocationUpdater] skip: sendAllowed=false"); return; }
      if (!this._isActive) { console.log("[LocationUpdater] skip: app inactive"); return; }
      if (!this._auth?.currentUser) { console.log("[LocationUpdater] skip: no user"); return; }
      await this._updateOnce();
    }, FIREBASE_UPDATE_INTERVAL);
  }

  _clearInterval() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  async _updateOnce() {
    try {
      const user = this._auth.currentUser;
      if (!user) {
        console.warn("[LocationUpdater] 로그인 필요 → 업로드 스킵");
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this._lastLoc = { lat: coords.latitude, lng: coords.longitude };
      this._notify();

      await setDoc(
        doc(this._db, "user_locations", user.uid),
        {
          uid: user.uid,
          location: new GeoPoint(coords.latitude, coords.longitude),
          time: serverTimestamp(),
        },
        { merge: true }
      );

      console.log("[LocationUpdater] 업로드:", coords.latitude, coords.longitude, "uid:", user.uid);
    } catch (e) {
      console.error("[LocationUpdater] 위치 저장 실패:", e);
    }
  }

  _handleAppState(state) {
    this._isActive = state === "active";
    console.log("[LocationUpdater] AppState:", state);
    if (this._isActive) {
      if (this._started && this._sendAllowed && this._auth?.currentUser) this._updateOnce();
      this._startInterval();
    } else {
      this._clearInterval();
    }
  }
}

export const locationUpdater = new LocationUpdater();
export default locationUpdater;