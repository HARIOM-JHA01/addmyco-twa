import axios from "axios";
import backgroundImg from "../assets/background.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKGROUND_IMAGE_STORAGE_KEY = "app-background-image-url";

const resolveBackgroundImageUrl = (backgroundImage: string) => {
  let bgImageUrl = backgroundImage.trim();
  if (!/^https?:\/\//i.test(bgImageUrl)) {
    const s = bgImageUrl.replace(/^\/+/, "");
    bgImageUrl = `${API_BASE_URL.replace(/\/$/, "")}/${s}`;
  }
  return bgImageUrl;
};

const applyBackgroundImage = (imageUrl: string) => {
  document.documentElement.style.setProperty(
    "--app-background-image",
    `url(${imageUrl})`
  );
  document.body.style.backgroundImage = `url(${imageUrl})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
};

export const applyCachedThemeFromStorage = () => {
  try {
    const savedBgColor = localStorage.getItem("app-background-color");
    const savedFontColor = localStorage.getItem("app-font-color");
    const savedBgImage = localStorage.getItem(BACKGROUND_IMAGE_STORAGE_KEY);

    if (savedBgColor) {
      document.documentElement.style.setProperty(
        "--app-background-color",
        savedBgColor
      );
    }
    if (savedFontColor) {
      document.documentElement.style.setProperty("--app-font-color", savedFontColor);
    }
    if (savedBgImage) {
      applyBackgroundImage(savedBgImage);
    }
  } catch (e) {
    console.debug("applyCachedThemeFromStorage failed", e);
  }
};

export const applyBgFromApiData = (data: any) => {
  try {
    const themeColor = data?.theme_color || data?.themeColor || "";
    const fontColor = data?.font_color || data?.fontColor || "";
    const themePayload = data?.theme || {};
    const rawBackgroundImage =
      data?.background_image ||
      data?.backgroundImage ||
      data?.Thumbnail ||
      data?.thumbnail ||
      data?.fileUrl ||
      themePayload?.background_image ||
      themePayload?.backgroundImage ||
      themePayload?.Thumbnail ||
      themePayload?.thumbnail ||
      themePayload?.fileUrl ||
      "";
    const backgroundImage = Array.isArray(rawBackgroundImage)
      ? rawBackgroundImage[0] || ""
      : rawBackgroundImage;

    if (themeColor && typeof themeColor === "string" && themeColor.trim()) {
      document.documentElement.style.setProperty(
        "--app-background-color",
        themeColor
      );
      localStorage.setItem("app-background-color", themeColor);
    }
    if (fontColor && typeof fontColor === "string" && fontColor.trim()) {
      document.documentElement.style.setProperty("--app-font-color", fontColor);
      localStorage.setItem("app-font-color", fontColor);
    }

    const hasValidImage =
      typeof backgroundImage === "string" && backgroundImage.trim().length > 0;
    if (hasValidImage) {
      const bgImageUrl = resolveBackgroundImageUrl(backgroundImage);
      localStorage.setItem(BACKGROUND_IMAGE_STORAGE_KEY, bgImageUrl);
      applyBackgroundImage(bgImageUrl);
    } else {
      localStorage.removeItem(BACKGROUND_IMAGE_STORAGE_KEY);
      applyBackgroundImage(backgroundImg);
    }
  } catch (e) {
    console.debug("applyBgFromApiData failed", e);
  }
};

export const fetchBackgroundByUsername = async (username?: string) => {
  try {
    if (!username) return;
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.post(
      `${API_BASE_URL}/getbackgroundbyusername`,
      { username },
      { headers }
    );

    if (res?.data?.success && res.data.data) {
      applyBgFromApiData(res.data.data);
      return;
    }

    applyCachedThemeFromStorage();
    if (!localStorage.getItem(BACKGROUND_IMAGE_STORAGE_KEY)) {
      applyBackgroundImage(backgroundImg);
    }
  } catch (e) {
    console.debug("fetchBackgroundByUsername failed", e);
    applyCachedThemeFromStorage();
    if (!localStorage.getItem(BACKGROUND_IMAGE_STORAGE_KEY)) {
      applyBackgroundImage(backgroundImg);
    }
  }
};

export default {
  applyBgFromApiData,
  fetchBackgroundByUsername,
  applyCachedThemeFromStorage,
};
