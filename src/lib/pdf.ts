import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { FetchedAyah } from "./quran";
import { saveAndShareBlob } from "./nativeFiles";

export async function downloadVersePdf(
  element: HTMLElement,
  ayah: FetchedAyah
): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#F7F1E3",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

  const today = new Date().toISOString().slice(0, 10);
  const safeSurah = ayah.surahNameEn.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Istikhara_${safeSurah}-${ayah.ayahNumber}_${today}.pdf`;
  const blob = pdf.output("blob");

  await saveAndShareBlob({
    blob,
    filename,
    kind: "pdf",
    openShareSheet: true,
  });
}
