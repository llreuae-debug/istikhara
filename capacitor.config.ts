import type { CapacitorConfig } from "@capacitor/cli";

// TODO: owner confirms final appId (com.istikhara.app) before Play Store / App Store submission
const config: CapacitorConfig = {
  appId: "com.istikhara.app",
  appName: "Istikhara",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0A1A2F",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0A1A2F",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#C9A227",
    },
  },
};

export default config;
