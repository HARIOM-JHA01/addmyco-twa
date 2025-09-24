import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThemePage() {
  const router = useNavigate();
  const [fontColor, setFontColor] = useState("#000000");
  const [themeColor, setThemeColor] = useState("#007cb6");

  const handleSave = () => {
    // Save theme settings to localStorage or context if needed
    // For now, just close the page
    router(-1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 flex flex-col gap-6">
        <h2 className="text-lg font-bold mb-2">Theme Settings</h2>
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
        <button
          className="mt-4 bg-[#007cb6] text-white rounded-full py-2 font-bold"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
