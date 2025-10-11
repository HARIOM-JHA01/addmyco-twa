import Layout from "../components/Layout";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateChamberPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    enName: "",
    cnName: "",
    designation: "",
    details: "",
    website: "",
    telegram: "",
    instagram: "",
    youtube: "",
    facebook: "",
    whatsapp: "",
    wechat: "",
    line: "",
    twitter: "",
    linkedin: "",
    snapchat: "",
    skype: "",
    tiktok: "",
    tgchannel: "",
    chamberfanpage: "",
    order: "1",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      if (
        selectedFile.type.startsWith("video/") &&
        selectedFile.type !== "video/mp4"
      ) {
        setError("Only MP4 video files are allowed.");
        setFile(null);
        setFilePreview(null);
        return;
      }
      setError("");
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const formData = new FormData();
      formData.append("chamber_name_english", form.enName);
      formData.append("chamber_name_chinese", form.cnName);
      formData.append("chamberdesignation", form.designation);
      formData.append("detail", form.details);
      formData.append("chamberwebsite", form.website);
      formData.append("WhatsApp", form.whatsapp);
      formData.append("WeChat", form.wechat);
      formData.append("Line", form.line);
      formData.append("Instagram", form.instagram);
      formData.append("Facebook", form.facebook);
      formData.append("Twitter", form.twitter);
      formData.append("Youtube", form.youtube);
      formData.append("Linkedin", form.linkedin);
      formData.append("SnapChat", form.snapchat);
      formData.append("Skype", form.skype);
      formData.append("TikTok", form.tiktok);
      formData.append("tgchannel", form.tgchannel);
      formData.append("chamberfanpage", form.chamberfanpage);
      formData.append("order", form.order);

      if (file) {
        if (file.type.startsWith("image/")) {
          formData.append("image", file);
        } else if (file.type.startsWith("video/")) {
          formData.append("video", file);
        }
      }

      await axios.post(`${API_BASE_URL}/chamber`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Chamber created successfully!");
      setForm({
        enName: "",
        cnName: "",
        designation: "",
        details: "",
        website: "",
        telegram: "",
        instagram: "",
        youtube: "",
        facebook: "",
        whatsapp: "",
        wechat: "",
        line: "",
        twitter: "",
        linkedin: "",
        snapchat: "",
        skype: "",
        tiktok: "",
        tgchannel: "",
        chamberfanpage: "",
        order: "1",
      });
      setFile(null);
      setFilePreview(null);

      setTimeout(() => {
        navigate("/chamber");
      }, 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create chamber"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-3 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-4">
            Create Chamber Profile
          </h2>
          <form
            className="w-full flex flex-col gap-2 items-center"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <input
              name="enName"
              placeholder="English Name for Chamber"
              value={form.enName}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500"
              required
            />
            <input
              name="cnName"
              placeholder="Chinese Name for Chamber"
              value={form.cnName}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500"
            />
            <input
              name="designation"
              placeholder="Designation in Chamber"
              value={form.designation}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500"
            />

            {/* Upload area */}
            <div className="w-full flex justify-center">
              {filePreview ? (
                <div className="flex items-center justify-center rounded-lg w-[366px] h-[200px] overflow-hidden bg-[#01a2e9]">
                  {file?.type.startsWith("image/") ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="object-cover w-[366px] h-[200px]"
                    />
                  ) : file?.type.startsWith("video/") ? (
                    <video
                      src={filePreview}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-cover w-[366px] h-[200px]"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="bg-[#01a2e9] text-center text-white font-bold py-6 mb-4 relative flex flex-col items-center justify-center w-[366px] h-[200px] rounded-2xl">
                  <div className="text-lg">
                    Please upload
                    <br />
                    640 width by 360 high Image
                    <br />
                    or
                  </div>
                  <div className="text-yellow-300 font-bold mt-2">
                    Premium Member Upload 1 Minute Video
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input and Browse/Cancel buttons */}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,video/mp4"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse
              </button>
              <button
                type="button"
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                }}
              >
                Cancel
              </button>
            </div>

            <textarea
              name="details"
              placeholder="Chamber details"
              value={form.details}
              onChange={handleChange}
              className="w-[330px] h-[200px] rounded-2xl px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white placeholder-gray-500"
              rows={5}
            />
            <input
              name="website"
              placeholder="Website for Chamber"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />
            <input
              name="telegram"
              placeholder="https://t.me/Telegram Id"
              value={form.telegram}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />
            <input
              name="instagram"
              placeholder="https://Instagram"
              value={form.instagram}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />
            <input
              name="youtube"
              placeholder="https://Youtube"
              value={form.youtube}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />
            <input
              name="facebook"
              placeholder="https://Facebook"
              value={form.facebook}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />
            <input
              name="order"
              placeholder="Set display order"
              value={form.order}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
            />

            {error && (
              <div className="text-red-500 mt-2 text-center w-full">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 mt-2 text-center w-full">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="mt-4 w-full bg-[#007cb6] text-white py-2 font-semibold text-lg disabled:opacity-50 rounded-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Chamber"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
