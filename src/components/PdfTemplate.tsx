import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import type { FetchedAyah } from "@/lib/quranApi";
import { getFormattedDates } from "@/lib/hijri";

interface PdfTemplateProps {
  ayah: FetchedAyah;
  categoryLabel?: string;
  privateNote?: string;
  includeNote?: boolean;
  appUrl: string;
}

export const PdfTemplate = forwardRef<HTMLDivElement, PdfTemplateProps>(
  ({ ayah, categoryLabel, privateNote, includeNote = false, appUrl }, ref) => {
    const [qrSrc, setQrSrc] = useState<string>("");
    const dates = getFormattedDates();
    const shareUrl = `${appUrl}/ayah/${ayah.surahNumber}/${ayah.ayahNumber}`;

    useEffect(() => {
      QRCode.toDataURL(shareUrl, {
        width: 140,
        margin: 1,
        color: { dark: "#0A1A2F", light: "#F7F1E3" },
      })
        .then(setQrSrc)
        .catch(() => setQrSrc(""));
    }, [shareUrl]);

    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "794px",
          height: "1123px",
          backgroundColor: "#F7F1E3",
          color: "#1B1B1B",
          padding: "42px",
          boxSizing: "border-box",
          fontFamily: "'Inter', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Ornamental geometric gold border */}
        <div
          style={{
            border: "2px solid #C9A227",
            padding: "8px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(201,162,39,0.5)",
              padding: "28px 34px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "30px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "#0A1A2F" }}>
                Istikhara &nbsp;•&nbsp; <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "#0B3D2E" }}>استخارہ</span>
              </div>
              <div style={{ fontSize: "13px", color: "#0B3D2E", marginTop: "4px" }}>
                قرآنی آیات کے ذریعے الہٰی رہنمائی — Receive divine guidance through Quranic verse
              </div>
              <div style={{ fontSize: "12px", color: "#555", marginTop: "10px" }}>
                {dates.hijriEn} &nbsp;|&nbsp; {dates.gregorianEn}
              </div>
              {categoryLabel && (
                <div
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    padding: "4px 14px",
                    border: "1px solid #C9A227",
                    borderRadius: "999px",
                    fontSize: "12px",
                    color: "#0A1A2F",
                  }}
                >
                  {categoryLabel}
                </div>
              )}
              {includeNote && privateNote?.trim() && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#333",
                    fontStyle: "italic",
                  }}
                >
                  “{privateNote.trim()}”
                </div>
              )}
            </div>

            {/* Verse Section */}
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <div style={{ fontSize: "15px", color: "#0B3D2E", fontWeight: 600, marginBottom: "14px" }}>
                {ayah.surahNameAr} &nbsp;•&nbsp; {ayah.surahNameEn} ({ayah.surahNumber}:{ayah.ayahNumber}) &nbsp;•&nbsp; Juz {ayah.juz}
              </div>
              <div
                dir="rtl"
                style={{
                  fontFamily: "'Amiri Quran', 'Amiri', serif",
                  fontSize: "28px",
                  lineHeight: 2.1,
                  color: "#0A1A2F",
                  marginBottom: "18px",
                }}
              >
                {ayah.arabicText} ﴿{ayah.ayahNumber}﴾
              </div>
              <div
                dir="rtl"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', serif",
                  fontSize: "17px",
                  lineHeight: 2.35,
                  color: "#1B1B1B",
                  marginBottom: "16px",
                }}
              >
                {ayah.urduText}
              </div>
              <div
                dir="ltr"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: "#2C2C2C",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                {ayah.englishText}
              </div>
            </div>

            {/* Sunnah reminder & Footer */}
            <div>
              <div
                style={{
                  borderTop: "1px solid rgba(201,162,39,0.45)",
                  paddingTop: "14px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#444",
                  lineHeight: 1.8,
                }}
              >
                <div dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: "12px" }}>
                  یہ آیت غور و فکر کے لیے ہے۔ مسنون استخارہ دو رکعت نماز اور دعا ہے — اہم فیصلوں میں اہلِ علم سے مشورہ بھی کریں۔
                </div>
                <div>
                  This verse is for reflection. The Sunnah Istikhara is two rak'ahs and the dua. For major decisions, also seek counsel from people of knowledge.
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "11px", color: "#555" }}>
                  Generated by Istikhara — {appUrl}
                </div>
                {qrSrc && <img src={qrSrc} alt="QR Code" style={{ width: "68px", height: "68px" }} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PdfTemplate.displayName = "PdfTemplate";
