import Layout from "../components/Layout";
import { useState, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";
import { formatUrl, getEmailError, getUrlError } from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const setProfileStore = useProfileStore((state) => state.setProfile);
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
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = useProfileStore((state) => state.profile);
  const isPremium = profile?.membertype === "premium";

  // Memoize preview URL so it doesn't reload on description change
  const previewUrl = useMemo(() => {
    if (form.image) {
      return URL.createObjectURL(form.image);
    }
    return null;
    // eslint-disable-next-line
  }, [form.image]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }

    // Real-time validation
    if (name === "email") {
      const emailError = getEmailError(value);
      if (emailError) {
        setValidationErrors({ ...validationErrors, email: emailError });
      }
    } else if (
      [
        "website",
        "WhatsApp",
        "telegramId",
        "facebook",
        "Instagram",
        "Youtube",
      ].includes(name)
    ) {
      const urlError = getUrlError(value, name);
      if (urlError) {
        setValidationErrors({ ...validationErrors, [name]: urlError });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // If file is a video, only allow mp4 and only for premium users
      if (file.type.startsWith("video/")) {
        if (!isPremium) {
          setError("Video uploads are available for premium users only.");
          setForm({ ...form, image: null });
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        if (file.type !== "video/mp4") {
          setError("Only MP4 video files are allowed.");
          setForm({ ...form, image: null });
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
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

    // Validate all fields before submission
    const errors: { [key: string]: string } = {};

    // Validate email
    if (form.email) {
      const emailError = getEmailError(form.email);
      if (emailError) errors.email = emailError;
    }

    // Validate all URL fields
    const urlFields = [
      "website",
      "WhatsApp",
      "telegramId",
      "Facebook",
      "Instagram",
      "Youtube",
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

      // Format all URLs before submission
      const formattedForm = { ...form };
      urlFields.forEach((field) => {
        const value = formattedForm[field as keyof typeof formattedForm];
        if (value && typeof value === "string") {
          (formattedForm as any)[field] = formatUrl(value);
        }
      });

      const formData = new FormData();
      Object.entries(formattedForm).forEach(([key, value]) => {
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
      // Re-fetch profile so the global store knows companydata exists
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileRes?.data?.data;
        if (profileData) {
          try {
            setProfileStore(profileData);
            // notify other parts of the app (App.tsx) that profile was updated
            try {
              window.dispatchEvent(
                new CustomEvent("profile-updated", { detail: profileData })
              );
            } catch (evErr) {
              console.warn("Failed to dispatch profile-updated event", evErr);
            }
          } catch (storeErr) {
            console.warn(
              "Failed to update profile store after company creation",
              storeErr
            );
          }
        }
      } catch (pfErr) {
        console.warn(
          "Failed to re-fetch profile after company creation",
          pfErr
        );
      }

      setTimeout(() => {
        navigate("/");
      }, 800);
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
            <div className="w-full flex justify-center mb-4">
              {form.image ? (
                <div className="flex items-center justify-center rounded-xl w-full h-48 overflow-hidden bg-[#01a2e9]">
                  {form.image.type.startsWith("image/") ? (
                    <img
                      src={previewUrl || undefined}
                      alt="Preview"
                      className="object-cover w-full h-48 rounded-xl"
                    />
                  ) : form.image.type.startsWith("video/") ? (
                    <video
                      src={previewUrl || undefined}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-cover w-full h-48 rounded-xl"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="bg-[#01a2e9] text-center text-white font-bold py-6 mb-4 relative flex flex-col items-center justify-center w-full h-48 rounded-xl">
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
              className="w-full h-48 rounded-xl px-4 py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={6}
            />
            <div className="w-full">
              <input
                name="website"
                placeholder="Website"
                value={form.website}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border ${
                  validationErrors.website
                    ? "border-red-500"
                    : "border-blue-500"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.website && (
                <div className="text-red-500 text-xs mt-1 px-2 mb-2">
                  {validationErrors.website}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="telegramId"
                placeholder="https://t.me/Telegram Id"
                value={form.telegramId || ""}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border ${
                  validationErrors.telegramId
                    ? "border-red-500"
                    : "border-blue-500"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.telegramId && (
                <div className="text-red-500 text-xs mt-1 px-2 mb-2">
                  {validationErrors.telegramId}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="facebook"
                placeholder="https://Facebook"
                value={form.facebook}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border ${
                  validationErrors.facebook
                    ? "border-red-500"
                    : "border-blue-500"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.facebook && (
                <div className="text-red-500 text-xs mt-1 px-2 mb-2">
                  {validationErrors.facebook}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="Instagram"
                placeholder="https://Instagram"
                value={form.Instagram || ""}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border ${
                  validationErrors.Instagram
                    ? "border-red-500"
                    : "border-blue-500"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Instagram && (
                <div className="text-red-500 text-xs mt-1 px-2 mb-2">
                  {validationErrors.Instagram}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="Youtube"
                placeholder="https://Youtube"
                value={form.Youtube || ""}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border ${
                  validationErrors.Youtube
                    ? "border-red-500"
                    : "border-blue-500"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Youtube && (
                <div className="text-red-500 text-xs mt-1 px-2 mb-2">
                  {validationErrors.Youtube}
                </div>
              )}
            </div>
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
