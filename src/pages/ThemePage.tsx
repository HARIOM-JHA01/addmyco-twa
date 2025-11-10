import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import i18n from "../i18n";

export default function ThemePage() {
  const router = useNavigate();
  const [fontColor, setFontColor] = useState(() => {
    try {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-font-color")
          .trim() || "#000000"
      );
    } catch (e) {
      return "#000000";
    }
  });
  const [themeColor, setThemeColor] = useState(() => {
    try {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-background-color")
          .trim() || "#007cb6"
      );
    } catch (e) {
      return "#007cb6";
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/colorbackground`,
        {
          fontcolor: fontColor,
          bgcolor: themeColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Save to localStorage for persistence across sessions
      localStorage.setItem("app-background-color", themeColor);
      localStorage.setItem("app-font-color", fontColor);

      // Apply the colors immediately to CSS variables
      document.documentElement.style.setProperty(
        "--app-background-color",
        themeColor
      );
      document.documentElement.style.setProperty("--app-font-color", fontColor);

      setSuccess("Theme updated successfully!");
      // Notify the app to re-fetch the background/theme settings
      try {
        window.dispatchEvent(new Event("background-updated"));
      } catch (e) {
        // ignore if window not available
      }
      setTimeout(() => router(-1), 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to update theme"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto flex flex-col gap-6 shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-[#2fa8e0] mb-2 text-center">
            {i18n.t("theme_settings")}
          </h2>
          <div className="flex flex-row justify-between gap-4">
            <label className="font-semibold min-w-[90px]">
              {i18n.t("font_color")}
            </label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-12 h-12 border-none outline-none cursor-pointer"
            />
          </div>
          <div className="flex flex-row justify-between gap-4">
            <label className="font-semibold min-w-[90px]">
              {i18n.t("theme_color")}
            </label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-12 h-12 border-none outline-none cursor-pointer"
            />
          </div>
          {error && (
            <div className="text-red-500 text-center text-sm">
              {i18n.t("failed_to_update_theme")}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-center text-sm">
              {i18n.t("theme_updated_success")}
            </div>
          )}
          <button
            className="mt-4 rounded-full py-2 font-bold disabled:opacity-60 text-[#007cb6]"
            onClick={handleSave}
            disabled={loading}
            style={{
              backgroundColor: "var(--app-background-color)",
              color: "#007cb6",
            }}
          >
            {loading ? i18n.t("saving") : i18n.t("save")}
          </button>
        </div>
      </div>
    </Layout>
  );
}
