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
