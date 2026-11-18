export type TtsProviderId = "azure" | "google" | "elevenlabs";

export type VoiceMode = "none" | "ai-translation" | "ai-tafseer" | "record";

export interface VoiceOption {
  id: string;
  provider: TtsProviderId;
  voiceId: string;
  labelUr: string;
  labelEn: string;
  gender: "female" | "male";
  supportsWordBoundaries: boolean;
}

export const URDU_VOICES: VoiceOption[] = [
  {
    id: "azure-uzma",
    provider: "azure",
    voiceId: "ur-PK-UzmaNeural",
    labelUr: "عظمیٰ (AI آواز — Azure ur-PK)",
    labelEn: "Uzma Neural (Azure ur-PK)",
    gender: "female",
    supportsWordBoundaries: true,
  },
  {
    id: "azure-asad",
    provider: "azure",
    voiceId: "ur-PK-AsadNeural",
    labelUr: "اسد (AI آواز — Azure ur-PK)",
    labelEn: "Asad Neural (Azure ur-PK)",
    gender: "male",
    supportsWordBoundaries: true,
  },
  {
    id: "google-ur-a",
    provider: "google",
    voiceId: "ur-IN-Wavenet-A",
    labelUr: "گوگل اردو (AI آواز — Female)",
    labelEn: "Google Urdu Wavenet A",
    gender: "female",
    supportsWordBoundaries: false,
  },
  {
    id: "google-ur-b",
    provider: "google",
    voiceId: "ur-IN-Wavenet-B",
    labelUr: "گوگل اردو (AI آواز — Male)",
    labelEn: "Google Urdu Wavenet B",
    gender: "male",
    supportsWordBoundaries: false,
  },
];

export const DEFAULT_VOICE_ID = "azure-uzma";
export const VOICE_RATE_MIN = 0.85;
export const VOICE_RATE_MAX = 1.1;
export const VOICE_RATE_DEFAULT = 0.95;

export function getVoiceById(id: string): VoiceOption {
  return URDU_VOICES.find((v) => v.id === id) ?? URDU_VOICES[0];
}
