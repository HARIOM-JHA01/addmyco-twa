import Layout from "../components/Layout";
import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name_english: "",
    company_name_chinese: "",
    companydesignation: "",
    description: "",
    email: "",
    WhatsApp: "",
    website: "",
    facebook: "",
    image: null as File | null,
    telegramId: "",
    Instagram: "",
    Youtube: "",
    company_order: "1",
  });
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
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type.startsWith("video/") && file.type !== "video/mp4") {
        setError("Only MP4 video files are allowed.");
        setForm({ ...form, image: null });
        return;
      }
      setError("");
      setForm({ ...form, image: file });
    } else {
      setForm({ ...form, image: null });
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
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value as File);
        } else {
          formData.append(key, value as string);
        }
      });
      await axios.post(`${API_BASE_URL}/companyprofile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Company profile created successfully!");
      setForm({
        company_name_english: "",
        company_name_chinese: "",
        companydesignation: "",
        description: "",
        email: "",
        WhatsApp: "",
        website: "",
        facebook: "",
        image: null,
        telegramId: "",
        Instagram: "",
        Youtube: "",
        company_order: "1",
      });
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create company profile"
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
            Create Company Profile
          </h2>
          <form
            className="w-full flex flex-col gap-2 items-center"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <input
              name="company_name_english"
              placeholder="Company Name in English"
              value={form.company_name_english}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              required
            />
            <input
              name="company_name_chinese"
              placeholder="Company Name in Chinese"
              value={form.company_name_chinese}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            />
            <input
              name="companydesignation"
              placeholder="Company Designation"
              value={form.companydesignation}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
            />
            {/* Info box for image/video upload instructions or preview */}
            <div className="w-full flex justify-center">
              {form.image ? (
                <div className="flex items-center justify-center w-[366px] h-[205px] overflow-hidden bg-[#01a2e9]">
                  {form.image.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="Preview"
                      className="object-cover w-[366px] h-[205px]"
                    />
                  ) : form.image.type.startsWith("video/") ? (
                    <video
                      src={URL.createObjectURL(form.image)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-cover w-[366px] h-[205px]"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="bg-[#01a2e9] text-center text-white font-bold py-6 mb-4 relative flex flex-col items-center justify-center w-[366px] h-[205px] rounded-2xl">
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
                onClick={() => setForm({ ...form, image: null })}
              >
                Cancel
              </button>
            </div>
            <textarea
              name="description"
              placeholder="Company description"
              value={form.description}
              onChange={handleChange}
              className="w-[330px] h-[150px] rounded-2xl px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={3}
            />
            <input
              name="website"
              placeholder="Website"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="telegramId"
              placeholder="https://t.me/Telegram Id"
              value={form.telegramId || ""}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="facebook"
              placeholder="https://Facebook"
              value={form.facebook}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="Instagram"
              placeholder="https://Instagram"
              value={form.Instagram || ""}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="Youtube"
              placeholder="https://Youtube"
              value={form.Youtube || ""}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Display order is set to 1 by default and hidden from the user */}
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
              className="mt-4 w-full bg-[#d40078] text-white py-2 font-semibold text-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Company"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
