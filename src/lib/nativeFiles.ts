import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Preferences } from "@capacitor/preferences";
import { Media } from "@capacitor-community/media";
import { InAppReview } from "@capacitor-community/in-app-review";
import { isNative } from "./platform";

const EXPORT_COUNT_KEY = "istikhara:exportCount";
const LAST_REVIEW_KEY = "istikhara:lastReviewAt";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = String(reader.result || "");
      const idx = res.indexOf(",");
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function recordExportAndMaybeRequestReview(): Promise<void> {
  if (!isNative()) return;
  try {
    const { value: countRaw } = await Preferences.get({ key: EXPORT_COUNT_KEY });
    const nextCount = (Number(countRaw) || 0) + 1;
    await Preferences.set({ key: EXPORT_COUNT_KEY, value: String(nextCount) });

    if (nextCount < 3) return;

    const { value: lastRaw } = await Preferences.get({ key: LAST_REVIEW_KEY });
    const lastTs = Number(lastRaw) || 0;
    if (Date.now() - lastTs < NINETY_DAYS_MS) return;

    await InAppReview.requestReview();
    await Preferences.set({ key: LAST_REVIEW_KEY, value: String(Date.now()) });
  } catch {
    // ignore review prompt errors
  }
}

export async function saveAndShareBlob(opts: {
  blob: Blob;
  filename: string;
  kind: "pdf" | "image" | "video";
  shareTitle?: string;
  shareText?: string;
  openShareSheet?: boolean;
}): Promise<void> {
  const {
    blob,
    filename,
    kind,
    shareTitle = "Istikhara — استخارہ",
    shareText = "",
    openShareSheet = false,
  } = opts;

  if (!isNative()) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const base64 = await blobToBase64(blob);
  const written = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  if (kind === "image") {
    await Media.savePhoto({ path: written.uri }).catch(() => {});
  } else if (kind === "video") {
    await Media.saveVideo({ path: written.uri }).catch(() => {});
  } else {
    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Documents,
    }).catch(() => {});
  }

  if (openShareSheet) {
    await Share.share({
      title: shareTitle,
      text: shareText,
      files: [written.uri],
      dialogTitle: shareTitle,
    });
  }

  await recordExportAndMaybeRequestReview();
}
