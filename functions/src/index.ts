// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

export const onAlertCreate = functions.firestore
  .document("alerts/{alertId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const alert = snap.data() as {
      userUid?: string;
      guardianUids?: string[];
      type?: string;
      deviceId?: string;
      status?: string;
      createdAt?: any;
      extra?: Record<string, any>;
    } | undefined;

    if (!alert) return;

    const guardianUids = Array.isArray(alert.guardianUids) ? alert.guardianUids : [];
    if (guardianUids.length === 0) return;

    const tokenSnaps = await Promise.all(
      guardianUids.map(uid => db.collection("users").doc(uid).collection("fcmTokens").get())
    );
    const tokens = tokenSnaps.flatMap(s => s.docs.map(d => d.id));
    if (tokens.length === 0) return;

    const title = alert.type === "fall" ? "낙상 감지" : "알림";
    const body = "보호 대상자에게서 이상 신호가 감지되었습니다.";

    const res = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      android: {
        priority: "high",
        notification: { channelId: "alerts" }
      },
      data: {
        type: String(alert.type ?? "alert"),
        userUid: String(alert.userUid ?? ""),
        alertId: context.params.alertId,
        deviceId: String(alert.deviceId ?? ""),
        status: String(alert.status ?? "")
      }
    });

    const cleanup: Promise<any>[] = [];
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code || "";
        if (code.includes("registration-token-not-registered") || code.includes("invalid-argument")) {
          const badToken = tokens[idx];
          cleanup.push(
            db
              .collectionGroup("fcmTokens")
              .where(admin.firestore.FieldPath.documentId(), "==", badToken)
              .get()
              .then(q => Promise.all(q.docs.map(doc => doc.ref.delete())))
          );
        }
      }
    });
    await Promise.all(cleanup);
  });