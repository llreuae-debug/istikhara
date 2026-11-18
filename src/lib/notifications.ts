import { LocalNotifications } from "@capacitor/local-notifications";
import { isNative } from "./platform";

const DAILY_NOTIF_ID = 1162;

export async function scheduleDailyVerseNotification(
  enabled: boolean,
  hour: number,
  minute: number,
  lang: "ur" | "en"
): Promise<boolean> {
  if (!isNative()) return false;

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] }).catch(
    () => {}
  );

  if (!enabled) return true;

  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return false;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_NOTIF_ID,
        title: lang === "ur" ? "آج کی آیت — استخارہ" : "Verse of the Day — Istikhara",
        body:
          lang === "ur"
            ? "قرآنِ پاک کی روشنی میں آج کا پیغامِ غور و فکر پڑھیں۔"
            : "Read today's Quranic verse for quiet reflection.",
        schedule: {
          on: { hour, minute },
          repeats: true,
          allowWhileIdle: true,
        },
        extra: { route: `/${lang}/daily` },
      },
    ],
  });

  return true;
}
