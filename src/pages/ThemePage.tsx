import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

export default function ThemePage() {
  const router = useNavigate();
  const [fontColor, setFontColor] = useState("#000000");
  const [themeColor, setThemeColor] = useState("#007cb6");

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
      setSuccess("Theme updated successfully!");
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
            Theme Settings
          </h2>
          <div className="flex flex-row justify-between gap-4">
            <label className="font-semibold min-w-[90px]">Font Color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-12 h-12 border-none outline-none cursor-pointer"
            />
          </div>
          <div className="flex flex-row justify-between gap-4">
            <label className="font-semibold min-w-[90px]">Theme Color</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-12 h-12 border-none outline-none cursor-pointer"
            />
          </div>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-center text-sm">{success}</div>
          )}
          <button
            className="mt-4 bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-60"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
