import axios from "axios";
import backgroundImg from "../assets/background.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const applyBgFromApiData = (data: any) => {
  try {
    const themeColor = data?.theme_color || data?.themeColor || "";
    const fontColor = data?.font_color || data?.fontColor || "";
    const backgroundImage =
      data?.background_image || data?.backgroundImage || "";

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
      let bgImageUrl = backgroundImage.trim();
      if (!/^https?:\/\//i.test(bgImageUrl)) {
        const s = bgImageUrl.replace(/^\/+/, "");
        bgImageUrl = `${API_BASE_URL.replace(/\/$/, "")}/${s}`;
      }
      document.documentElement.style.setProperty(
        "--app-background-image",
        `url(${bgImageUrl})`
      );
      document.body.style.backgroundImage = `url(${bgImageUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.documentElement.style.setProperty(
        "--app-background-image",
        `url(${backgroundImg})`
      );
      document.body.style.backgroundImage = `url(${backgroundImg})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
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

    const savedBgColor = localStorage.getItem("app-background-color");
    const savedFontColor = localStorage.getItem("app-font-color");
    if (savedBgColor)
      document.documentElement.style.setProperty(
        "--app-background-color",
        savedBgColor
      );
    if (savedFontColor)
      document.documentElement.style.setProperty(
        "--app-font-color",
        savedFontColor
      );
    document.documentElement.style.setProperty(
      "--app-background-image",
      `url(${backgroundImg})`
    );
    document.body.style.backgroundImage = `url(${backgroundImg})`;
  } catch (e) {
    console.debug("fetchBackgroundByUsername failed", e);
    const savedBgColor = localStorage.getItem("app-background-color");
    const savedFontColor = localStorage.getItem("app-font-color");
    if (savedBgColor)
      document.documentElement.style.setProperty(
        "--app-background-color",
        savedBgColor
      );
    if (savedFontColor)
      document.documentElement.style.setProperty(
        "--app-font-color",
        savedFontColor
      );
    document.documentElement.style.setProperty(
      "--app-background-image",
      `url(${backgroundImg})`
    );
    document.body.style.backgroundImage = `url(${backgroundImg})`;
  }
};

export default { applyBgFromApiData, fetchBackgroundByUsername };
