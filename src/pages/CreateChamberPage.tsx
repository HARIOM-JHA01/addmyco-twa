import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatUrl, getUrlError } from "../utils/validation";
import WebApp from "@twa-dev/sdk";

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
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = useProfileStore((state) => state.profile);
  const isPremium = profile?.membertype === "premium";
  const [occupiedOrders, setOccupiedOrders] = useState<number[]>([]);

  const fetchChambers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/getchamberprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: any = null;
      if (res.data && res.data.data) data = res.data.data;
      else if (res.data && typeof res.data === "object") data = res.data;
      else if (res.data && res.data.chamber) data = res.data.chamber;
      const items = Array.isArray(data) ? data : data ? [data] : [];
      const orders = items
        .map((c: any) => Number(c.chamber_order ?? c.order ?? -1))
        .filter((n: number) => !isNaN(n) && n > 0 && n <= 15);
      setOccupiedOrders(orders);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchChambers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }

    // Real-time validation for URL fields
    const urlFields = [
      "website",
      "telegram",
      "instagram",
      "youtube",
      "facebook",
      "whatsapp",
      "wechat",
      "line",
      "twitter",
      "linkedin",
      "snapchat",
      "skype",
      "tiktok",
      "tgchannel",
      "chamberfanpage",
    ];

    if (urlFields.includes(name)) {
      const urlError = getUrlError(value, name);
      if (urlError) {
        setValidationErrors({ ...validationErrors, [name]: urlError });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      // If file is a video, only allow mp4 and only for premium users
      if (selectedFile.type.startsWith("video/")) {
        if (!isPremium) {
          WebApp.showAlert(
            "Video uploads are available for premium users only."
          );
          setFile(null);
          setFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        if (selectedFile.type !== "video/mp4") {
          setError("Only MP4 video files are allowed.");
          setFile(null);
          setFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
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

    // Validate all URL fields before submission
    const errors: { [key: string]: string } = {};
    const urlFields = [
      "website",
      "telegram",
      "instagram",
      "youtube",
      "facebook",
      "whatsapp",
      "wechat",
      "line",
      "twitter",
      "linkedin",
      "snapchat",
      "skype",
      "tiktok",
      "tgchannel",
      "chamberfanpage",
    ];

    urlFields.forEach((field) => {
      const value = form[field as keyof typeof form];
      if (value && typeof value === "string") {
        const urlError = getUrlError(value, field);
        if (urlError) errors[field] = urlError;
      }
    });

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please fix the validation errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const formData = new FormData();
      formData.append("chamber_name_english", form.enName);
      formData.append("chamber_name_chinese", form.cnName);
      formData.append("chamberdesignation", form.designation);
      formData.append("detail", form.details);
      // Format all URLs before submission
      formData.append(
        "chamberwebsite",
        form.website ? formatUrl(form.website) : ""
      );
      formData.append(
        "WhatsApp",
        form.whatsapp ? formatUrl(form.whatsapp) : ""
      );
      formData.append("WeChat", form.wechat ? formatUrl(form.wechat) : "");
      formData.append("Line", form.line ? formatUrl(form.line) : "");
      formData.append(
        "Instagram",
        form.instagram ? formatUrl(form.instagram) : ""
      );
      formData.append(
        "Facebook",
        form.facebook ? formatUrl(form.facebook) : ""
      );
      formData.append("Twitter", form.twitter ? formatUrl(form.twitter) : "");
      formData.append("Youtube", form.youtube ? formatUrl(form.youtube) : "");
      formData.append(
        "Linkedin",
        form.linkedin ? formatUrl(form.linkedin) : ""
      );
      formData.append(
        "SnapChat",
        form.snapchat ? formatUrl(form.snapchat) : ""
      );
      formData.append("Skype", form.skype ? formatUrl(form.skype) : "");
      formData.append("TikTok", form.tiktok ? formatUrl(form.tiktok) : "");
      formData.append(
        "tgchannel",
        form.tgchannel ? formatUrl(form.tgchannel) : ""
      );
      formData.append(
        "chamberfanpage",
        form.chamberfanpage ? formatUrl(form.chamberfanpage) : ""
      );
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

      // Re-fetch profile so global store is up-to-date
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileRes?.data?.data;
        if (profileData) {
          try {
            const setProfileStore = useProfileStore.getState().setProfile;
            setProfileStore(profileData);
            try {
              window.dispatchEvent(
                new CustomEvent("profile-updated", { detail: profileData })
              );
            } catch (evErr) {
              console.warn("Failed to dispatch profile-updated event", evErr);
            }
          } catch (storeErr) {
            console.warn(
              "Failed to update profile store after chamber creation",
              storeErr
            );
          }
        }
      } catch (pfErr) {
        console.warn(
          "Failed to re-fetch profile after chamber creation",
          pfErr
        );
      }

      // refresh occupied orders so UI shows newly created chamber's order
      try {
        await fetchChambers();
      } catch {}

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
            <div className="w-full flex justify-center mb-4">
              {filePreview ? (
                <div
                  className="flex items-center justify-center rounded-xl w-full h-48 overflow-hidden"
                  style={{ backgroundColor: "var(--app-background-color)" }}
                >
                  {file?.type.startsWith("image/") ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="object-cover w-full h-48 rounded-xl"
                    />
                  ) : file?.type.startsWith("video/") ? (
                    <video
                      src={filePreview}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-cover w-full h-48 rounded-xl"
                    />
                  ) : null}
                </div>
              ) : (
                <div
                  className="text-center text-white font-bold py-6 mb-4 relative flex flex-col items-center justify-center w-full h-48 rounded-xl"
                  style={{ backgroundColor: "var(--app-background-color)" }}
                >
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
              accept={
                isPremium
                  ? "image/png,image/jpeg,image/jpg,image/gif,image/webp,video/mp4"
                  : "image/png,image/jpeg,image/jpg,image/gif,image/webp"
              }
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
              className="w-full h-48 rounded-xl px-4 py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={6}
            />
            <div className="w-full">
              <input
                name="website"
                placeholder="Website for Chamber"
                value={form.website}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border-2 ${
                  validationErrors.website
                    ? "border-red-500"
                    : "border-blue-200"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500`}
              />
              {validationErrors.website && (
                <div className="text-red-500 text-xs px-2 mb-2">
                  {validationErrors.website}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="telegram"
                placeholder="https://t.me/Telegram Id"
                value={form.tgchannel}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border-2 ${
                  validationErrors.telegram
                    ? "border-red-500"
                    : "border-blue-200"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500`}
              />
              {validationErrors.tgchannel && (
                <div className="text-red-500 text-xs px-2 mb-2">
                  {validationErrors.tgchannel}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="instagram"
                placeholder="https://Instagram"
                value={form.instagram}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border-2 ${
                  validationErrors.instagram
                    ? "border-red-500"
                    : "border-blue-200"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500`}
              />
              {validationErrors.instagram && (
                <div className="text-red-500 text-xs px-2 mb-2">
                  {validationErrors.instagram}
                </div>
              )}
            </div>
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
            <div className="w-full mb-2">
              <label className="block text-sm mb-1">Display Order</label>
              <select
                name="order"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                  <option
                    key={n}
                    value={String(n)}
                    disabled={occupiedOrders.includes(n)}
                  >
                    {n}
                    {occupiedOrders.includes(n) ? " (taken)" : ""}
                  </option>
                ))}
              </select>
              <div className="text-xs text-black mt-1">
                Numbers marked "(taken)" are already used by other chambers and
                are disabled.
              </div>
            </div>

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
              className="mt-4 w-full py-2 font-semibold text-lg disabled:opacity-50 rounded-full"
              disabled={loading}
              style={{
                backgroundColor: "var(--app-background-color)",
                color: "var(--app-font-color)",
              }}
            >
              {loading ? "Saving..." : "Save Chamber"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
