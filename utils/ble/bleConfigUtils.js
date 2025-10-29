// utils/ble/bleConfigUtils.js

/**
 * =================================================================================
 * ※ 주의: React Native 환경에서는 atob/btoa를 지원하지 않을 수 있습니다.
 *   만약 atob이 정의되어 있지 않다면, 다음과 같이 작은 폴리필을 추가하세요:
 *
 *   global.atob = (base64) => Buffer.from(base64, "base64").toString("binary");
 *   global.btoa = (binary) => Buffer.from(binary, "binary").toString("base64");
 *
 * =================================================================================
 */

//
// 1) 서비스 UUID (실제 디바이스의 Config 서비스 UUID로 교체)
//
const CONFIG_SVC_UUID = "87654321-1234-5678-1234-56789abcdef0";

//
// 2) Configuration 변경용 Characteristic UUID
//
export const LIGHT_CONFIG_CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef1";
export const ALARM_CONFIG_CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef2";
export const VOLUME_CONFIG_CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef3";

//
// 3) “정수 한 바이트 (0~255)”를 쓰기 전용 함수들은 이전과 동일하게 유지
//

import { Buffer } from "buffer";

export async function writeLightByte(device, byteValue) {
  if (typeof byteValue !== "number" || byteValue < 0 || byteValue > 255) {
    throw new Error("writeLightByte: 0~255 사이의 정수만 가능합니다.");
  }
  const buf = Buffer.from([byteValue & 0xff]);
  const base64data = buf.toString("base64");

  try {
    return await device.writeCharacteristicWithoutResponseForService(
      CONFIG_SVC_UUID,
      LIGHT_CONFIG_CHAR_UUID,
      base64data
    );
  } catch (e) {
    return await device.writeCharacteristicWithResponseForService(
      CONFIG_SVC_UUID,
      LIGHT_CONFIG_CHAR_UUID,
      base64data
    );
  }
}

export async function writeAlarmByte(device, byteValue) {
  if (typeof byteValue !== "number" || byteValue < 0 || byteValue > 255) {
    throw new Error("writeAlarmByte: 0~255 사이의 정수만 가능합니다.");
  }
  const buf = Buffer.from([byteValue & 0xff]);
  const base64data = buf.toString("base64");

  try {
    return await device.writeCharacteristicWithoutResponseForService(
      CONFIG_SVC_UUID,
      ALARM_CONFIG_CHAR_UUID,
      base64data
    );
  } catch (e) {
    return await device.writeCharacteristicWithResponseForService(
      CONFIG_SVC_UUID,
      ALARM_CONFIG_CHAR_UUID,
      base64data
    );
  }
}

export async function writeVolumeByte(device, byteValue) {
  if (typeof byteValue !== "number" || byteValue < 0 || byteValue > 255) {
    throw new Error("writeVolumeByte: 0~255 사이의 정수만 가능합니다.");
  }
  const buf = Buffer.from([byteValue & 0xff]);
  const base64data = buf.toString("base64");

  try {
    return await device.writeCharacteristicWithoutResponseForService(
      CONFIG_SVC_UUID,
      VOLUME_CONFIG_CHAR_UUID,
      base64data
    );
  } catch (e) {
    return await device.writeCharacteristicWithResponseForService(
      CONFIG_SVC_UUID,
      VOLUME_CONFIG_CHAR_UUID,
      base64data
    );
  }
}

//
// 4) “한 바이트”를 Base64 디코딩 → 정수로 변환하여 반환
//

/**
 * atob(polyfill) 확인
 * React Native 환경에서 atob이 정의되어 있지 않다면,
 * 아래와 같이 간단히 폴리필을 추가하세요.
 */
if (typeof atob === "undefined") {
  global.atob = (base64) => Buffer.from(base64, "base64").toString("binary");
}

/**
 * 전조등(Light) 현재 상태 읽기 → 0 또는 1
 * @param {Device} device
 * @returns {Promise<number>}
 */
export async function readLightByte(device) {
  const char = await device.readCharacteristicForService(
    CONFIG_SVC_UUID,
    LIGHT_CONFIG_CHAR_UUID
  );
  if (!char.value) {
    throw new Error("readLightByte: characteristic 값이 없습니다.");
  }
  // Base64 문자열 → 바이너리 문자열 → 첫 바이트의 charCodeAt(0)
  const binary = atob(char.value);
  return binary.charCodeAt(0);
}

/**
 * 알람(Alarm) 현재 상태 읽기 → 0~255 정수 (예시: 단일 바이트)
 * @param {Device} device
 * @returns {Promise<number>}
 */
export async function readAlarmByte(device) {
  const char = await device.readCharacteristicForService(
    CONFIG_SVC_UUID,
    ALARM_CONFIG_CHAR_UUID
  );
  if (!char.value) {
    throw new Error("readAlarmByte: characteristic 값이 없습니다.");
  }
  const binary = atob(char.value);
  return binary.charCodeAt(0);
}

/**
 * 볼륨(Volume) 현재 상태 읽기 → 0~255 정수
 * @param {Device} device
 * @returns {Promise<number>}
 */
export async function readVolumeByte(device) {
  const char = await device.readCharacteristicForService(
    CONFIG_SVC_UUID,
    VOLUME_CONFIG_CHAR_UUID
  );
  if (!char.value) {
    throw new Error("readVolumeByte: characteristic 값이 없습니다.");
  }
  const binary = atob(char.value);
  return binary.charCodeAt(0);
}

/**
 * 배터리 레벨을 실시간으로 구독 (notify 방식)
 * @param {Device} device
 * @param {(level: number) => void} setBatteryLevel - 배터리 레벨 수신 콜백
 * @returns {Subscription} 구독 객체 (subscription.remove()로 해제)
 */
export function readBatteryByte(device, setBatteryLevel) {
  const BATTERY_SERVICE_UUID = "87654321-1234-5678-1234-56789abcdef0";  // 표준 Battery Service UUID
  const BATTERY_CHAR_UUID = "2A19";     // 표준 Battery Level Characteristic UUID

  return device.monitorCharacteristicForService(
    BATTERY_SERVICE_UUID,
    BATTERY_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error("❌ 배터리 구독 오류:", error.message);
        return;
      }

      if (!characteristic?.value) {
        console.warn("⚠️ characteristic 값 없음");
        return;
      }

      try {
        const binary = atob(characteristic.value);
        const level = binary.charCodeAt(0);
        setBatteryLevel(level);
      } catch (decodeErr) {
        console.error("❌ 배터리 값 디코딩 실패:", decodeErr);
      }
    }
  );
}

/**
 * 낙상 감지 이벤트를 실시간으로 구독 (notify 방식)
 * @param {Device} device - BLE 디바이스 객체
 * @param {Object} auth - Firebase Auth 인스턴스
 * @param {Object} db - Firestore DB 인스턴스
 * @param {Object} options - 추가 옵션
 * @param {Function} options.guardianUidsResolver - Guardian UIDs를 가져오는 함수
 * @returns {Subscription} 구독 객체 (subscription.remove()로 해제)
 */
export function subscribeToFallDetection(device, auth, db, options = {}) {
  const FALL_DETECTION_SERVICE_UUID = "87654321-1234-5678-1234-56789abcdef0";
  const FALL_DETECTION_CHAR_UUID = "abcdef01-1234-5678-1234-56789abcdef6"; // 낙상 감지용 UUID

  const { guardianUidsResolver } = options;

  return device.monitorCharacteristicForService(
    FALL_DETECTION_SERVICE_UUID,
    FALL_DETECTION_CHAR_UUID,
    async (error, characteristic) => {
      if (error) {
        console.error("❌ 낙상 감지 구독 오류:", error.message);
        return;
      }

      if (!characteristic?.value) {
        console.warn("⚠️ 낙상 감지 characteristic 값 없음");
        return;
      }

      try {
        const binary = atob(characteristic.value);
        const fallDetected = binary.charCodeAt(0);

        // 낙상 감지 (예: 1이면 낙상)
        if (fallDetected === 1) {
          console.log("🚨 낙상 감지됨!");

          // Firebase에 Alert 생성
          const userUid = auth.currentUser?.uid;
          if (!userUid) {
            console.warn("⚠️ 사용자 인증 정보 없음");
            return;
          }

          let guardianUids = [];
          if (guardianUidsResolver) {
            guardianUids = await guardianUidsResolver(userUid);
          }

          const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
          
          await addDoc(collection(db, "alerts"), {
            userUid,
            guardianUids,
            type: "fall",
            deviceId: device.id,
            createdAt: serverTimestamp(),
            status: "new",
            extra: { autoDetected: true }
          });

          console.log("✅ 낙상 감지 alert 생성 완료");
        }
      } catch (decodeErr) {
        console.error("❌ 낙상 감지 값 디코딩 실패:", decodeErr);
      }
    }
  );
}
