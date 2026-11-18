import { useState } from "react";
import { useApp } from "@/lib/i18n";
import { GeometricBackground } from "@/components/GeometricBackground";
import { AppHeader } from "@/components/AppShell";
import { Head } from "@/seo/Head";
import {
  GlassButton,
  GlassCard,
  GlassChip,
  GlassInput,
  GlassModal,
  GlassSegmented,
  GlassSelect,
  GlassSheet,
  GlassSkeleton,
  GlassSlider,
  GlassTextarea,
  GlassToast,
  GlassToggle,
  GlassTooltip,
  LiquidGlassTabs,
} from "@/components/glass";

export default function UiKit() {
  const { uiLang, isRtl, settings, updateSettings } = useApp();
  const isUrdu = uiLang === "ur";

  const [heroTab, setHeroTab] = useState("work");
  const [seg, setSeg] = useState("tarjuma");
  const [toggle, setToggle] = useState(true);
  const [slider, setSlider] = useState(56);
  const [chip, setChip] = useState("marriage");
  const [selectVal, setSelectVal] = useState("midnight");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const heroItems = isUrdu
    ? [
        { id: "work", label: "ہوم" },
        { id: "studio", label: "اسٹوڈیو" },
        { id: "journal", label: "ڈائری" },
        { id: "contact", label: "رابطہ" },
      ]
    : [
        { id: "work", label: "Home" },
        { id: "studio", label: "Studio" },
        { id: "journal", label: "Journal" },
        { id: "contact", label: "Contact" },
      ];

  return (
    <div className="min-h-dvh flex flex-col pb-24">
      <Head
        pageKey="ui-kit"
        lang={uiLang}
        title="Istikhara — Liquid Glass UI Kit"
        robots="noindex,nofollow"
      />
      <GeometricBackground />
      <AppHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display-serif text-3xl font-semibold text-[var(--accent-gold)]">
            Liquid Glass UI Kit
          </h1>
          <div className="flex items-center gap-2">
            <GlassSegmented
              isRtl={isRtl}
              value={settings.theme}
              onChange={(id) => updateSettings({ theme: id as "dark" | "light" | "auto" })}
              items={[
                { id: "dark", label: isUrdu ? "مڈنائٹ گلاس" : "Midnight Glass" },
                { id: "light", label: isUrdu ? "مون لائٹ گلاس" : "Moonlight Glass" },
              ]}
            />
          </div>
        </div>

        {/* Hero LiquidGlassTabs */}
        <GlassCard variant="glass-2" className="p-6 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-[var(--accent-gold)]">
            &lt;LiquidGlassTabs /&gt;
          </h2>
          <LiquidGlassTabs
            items={heroItems}
            value={heroTab}
            onChange={setHeroTab}
            isRtl={isRtl}
            helperText="ٹیب پر کلک کریں، لینز کو کھینچیں، یا ← → استعمال کریں"
          />
        </GlassCard>

        {/* GlassCard & Quran solid verse guard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard variant="glass-2" tilt hoverLift className="p-5 space-y-2">
            <h2 className="font-semibold text-[var(--accent-gold)]">GlassCard (glass-2 + 4° tilt)</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Hover on desktop for cursor specular light, lift, and gentle tilt.
            </p>
          </GlassCard>

          <GlassCard variant="solid-verse" specular={false} className="p-5 space-y-2">
            <h2 className="font-semibold text-[var(--accent-gold)]">Quran Solid Layer (≥ 0.88 opacity)</h2>
            <p className="font-quran-madani text-xl text-[var(--text-primary)]">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Zero blur, zero refraction, zero glints over Quran text.
            </p>
          </GlassCard>
        </div>

        {/* Buttons, Segmented, Toggle, Slider, Chips */}
        <GlassCard variant="glass-1" className="p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton variant="primary">Primary Lens CTA</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassTooltip content="Glass Tooltip">
              <GlassButton variant="icon" aria-label="Tooltip trigger">?</GlassButton>
            </GlassTooltip>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <GlassSegmented
              isRtl={isRtl}
              value={seg}
              onChange={setSeg}
              items={[
                { id: "tarjuma", label: "اردو ترجمہ" },
                { id: "tafseer", label: "اردو تفسیر" },
                { id: "only", label: "صرف تفسیر" },
              ]}
            />
            <div className="flex items-center gap-2">
              <GlassToggle checked={toggle} onChange={setToggle} label="Toggle demo" />
              <span className="text-xs text-[var(--text-secondary)]">GlassToggle</span>
            </div>
          </div>

          <div className="max-w-xs">
            <span className="text-xs text-[var(--text-secondary)]">GlassSlider ({slider})</span>
            <GlassSlider value={slider} min={32} max={72} onChange={setSlider} />
          </div>

          <div className="flex flex-wrap gap-2">
            {["marriage", "business", "job", "travel"].map((c) => (
              <GlassChip key={c} selected={chip === c} onClick={() => setChip(c)}>
                {c}
              </GlassChip>
            ))}
          </div>
        </GlassCard>

        {/* Inputs, Select, Sheet, Modal, Toast, Skeleton */}
        <GlassCard variant="glass-2" className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassInput placeholder="GlassInput…" />
            <GlassSelect
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: "midnight", label: "Midnight Glass" },
                { value: "moonlight", label: "Moonlight Glass" },
                { value: "auto", label: "Auto" },
              ]}
            />
          </div>
          <GlassTextarea rows={2} placeholder="GlassTextarea…" />
          <div className="flex flex-wrap gap-3">
            <GlassButton variant="secondary" onClick={() => setSheetOpen(true)}>
              Open GlassSheet
            </GlassButton>
            <GlassButton variant="secondary" onClick={() => setModalOpen(true)}>
              Open GlassModal
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => {
                setToastOpen(true);
                setTimeout(() => setToastOpen(false), 2000);
              }}
            >
              Show GlassToast
            </GlassButton>
          </div>
          <GlassSkeleton className="h-10 w-2/3" />
        </GlassCard>
      </main>

      <GlassSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="GlassSheet">
        <p className="text-sm text-[var(--text-secondary)]">Drag down the handle or tap close.</p>
      </GlassSheet>
      <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} title="GlassModal">
        <p className="text-sm text-[var(--text-secondary)]">Frosted centered modal.</p>
      </GlassModal>
      <GlassToast open={toastOpen} message="Copied with Liquid Glass!" />
    </div>
  );
}
