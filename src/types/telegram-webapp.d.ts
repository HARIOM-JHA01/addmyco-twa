declare global {
  interface TelegramWebApp {
    ready(): void;
    expand(): void;
    close(): void;
    isExpanded: boolean;
    initData: string;
    initDataUnsafe: any;
    showScanQrPopup(params: {
      text?: string;
      callback?: (text: string) => void;
    }): void;
    closeScanQrPopup(): void;
    openLink(url: string): void;
    openTelegramLink(url: string): void;
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    version: string;
    colorScheme: "light" | "dark";
    themeParams: {
      bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
    };
  }

  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// This export is needed to make this a module
export {};
