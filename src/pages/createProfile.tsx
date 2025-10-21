import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import addmycoIcon from "../assets/addmyco.png";
import WebApp from "@twa-dev/sdk";
import { useProfileStore } from "../store/profileStore";
import {
  formatUrl,
  getEmailError,
  getPhoneError,
  getUrlError,
} from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function CreateProfile() {
  const user = WebApp.initDataUnsafe.user;
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);

  const [form, setForm] = useState({
    owner_name_english: "",
    owner_name_chinese: "",
    telegramId: user?.username || "",
    email: "",
    contact: "",
    address1: "",
    address2: "",
    address3: "",
    WhatsApp: "",
    WeChat: "",
    Line: "",
    Instagram: "",
    Facebook: "",
    Twitter: "",
    Youtube: "",
    Linkedin: "",
    SnapChat: "",
    TikTok: "",
  });
  const [profile_image, setProfileImage] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberType, setMemberType] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      navigate("/");
    }
    // Fetch memberType if token exists
    const fetchMemberType = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/getprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberType(res.data.data?.membertype || "");
      } catch {}
    };
    fetchMemberType();
  }, [profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } else if (name === "contact") {
      const phoneError = getPhoneError(value);
      if (phoneError) {
        setValidationErrors({ ...validationErrors, contact: phoneError });
      }
    } else if (
      [
        "WhatsApp",
        "Instagram",
        "Facebook",
        "Twitter",
        "Youtube",
        "Linkedin",
        "SnapChat",
        "TikTok",
        "WeChat",
        "Line",
      ].includes(name)
    ) {
      const urlError = getUrlError(value, name);
      if (urlError) {
        setValidationErrors({ ...validationErrors, [name]: urlError });
      }
    }
  };
  const handleProfileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // If user is premium allow mp4 videos, otherwise only images
    const isPremium = memberType === "premium";

    if (file.type.startsWith("image/")) {
      setMediaType("image");
      setMediaPreview(URL.createObjectURL(file));
      setProfileImage(file);
      setError("");
    } else if (file.type === "video/mp4") {
      if (!isPremium) {
        setError("Video uploads are available for premium users only.");
        setMediaPreview(null);
        setMediaType(null);
        setProfileImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
      setProfileImage(file);
      setError("");
    } else {
      setError(
        "Only MP4 video files are allowed for videos, otherwise upload an image."
      );
      setMediaPreview(null);
      setMediaType(null);
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

    // Validate contact
    if (form.contact) {
      const phoneError = getPhoneError(form.contact);
      if (phoneError) errors.contact = phoneError;
    }

    // Validate all URL fields
    const urlFields = [
      "WhatsApp",
      "Instagram",
      "Facebook",
      "Twitter",
      "Youtube",
      "Linkedin",
      "SnapChat",
      "TikTok",
      "WeChat",
      "Line",
    ];
    urlFields.forEach((field) => {
      const value = form[field as keyof typeof form];
      if (value) {
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
        if (value) {
          formattedForm[field as keyof typeof formattedForm] = formatUrl(value);
        }
      });

      const formData = new FormData();
      Object.entries(formattedForm).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (profile_image) formData.append("profile_image", profile_image);
      await axios.post(`${API_BASE_URL}/addprofile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Profile created successfully! Checking company profile...");
      // Call getProfile and check for company data
      try {
        const res = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Check if company exists by looking for company_name_english and company_name_chinese in companydata
        const hasCompany =
          res.data.data?.companydata &&
          res.data.data.companydata.company_name_english &&
          res.data.data.companydata.company_name_chinese;

        if (hasCompany) {
          setTimeout(() => navigate("/"), 1200);
        } else {
          setTimeout(() => navigate("/create-company"), 1200);
        }
      } catch {
        setTimeout(() => navigate("/create-company"), 1200);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // After successful profile creation or login, check for companydata
  if (profile && profile.companydata) {
    navigate("/");
    return;
  }

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.jpg')] bg-cover bg-center flex flex-col items-center overflow-x-hidden w-full">
      <Header />
      <div className="flex flex-col items-center w-full flex-1 mt-4 px-2">
        <div className="bg-white bg-opacity-80 rounded-3xl p-4 pt-2 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-bold text-center mt-2 mb-2">
            Complete your Profile
          </h2>
          <form
            className="w-full flex flex-col items-center"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="flex w-full gap-2 mb-2 flex-row justify-between">
              <input
                name="owner_name_english"
                placeholder="Name in English"
                value={form.owner_name_english}
                onChange={handleChange}
                className="w-44 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                name="owner_name_chinese"
                placeholder="Name in Chinese"
                value={form.owner_name_chinese}
                onChange={handleChange}
                className="w-44 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col items-center mb-2">
              <div
                className="rounded-full flex items-center justify-center mb-6 cursor-pointer"
                onClick={handleProfileIconClick}
              >
                {mediaPreview ? (
                  mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Profile Preview"
                      className="w-[180px] h-[180px] object-cover rounded-full"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      autoPlay
                      loop
                      muted
                      className="w-[180px] h-[180px] object-cover rounded-full"
                    />
                  )
                ) : (
                  <img
                    src={addmycoIcon}
                    alt="Default Icon"
                    className="w-[180px] h-[180px] object-cover rounded-full"
                  />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  memberType === "premium" ? "image/*,video/mp4" : "image/*"
                }
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {memberType === "premium" ? (
                <span className="text-xs text-gray-600 text-center">
                  You can upload a 180 x 180 image or an MP4 video as your
                  profile media.
                </span>
              ) : (
                <span className="text-xs text-gray-600 text-center">
                  Upload Profile Image
                  <br />
                  Size 180 x 180
                </span>
              )}
            </div>
            <div className="flex w-full gap-2 mb-2 flex-row justify-between">
              <input
                name="telegram_username"
                placeholder="Telegram Username"
                value={user?.username || ""}
                onChange={handleChange}
                className="w-44 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                readOnly
              />
              <div className="w-44">
                <input
                  name="contact"
                  placeholder="Contact No."
                  value={form.contact}
                  onChange={handleChange}
                  className={`w-full rounded-full px-3 py-2 border ${
                    validationErrors.contact
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
                {validationErrors.contact && (
                  <div className="text-red-500 text-xs mt-1 px-2">
                    {validationErrors.contact}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full mb-2">
              <input
                name="WhatsApp"
                placeholder="https://WhatsApp"
                value={form.WhatsApp}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.WhatsApp
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.WhatsApp && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.WhatsApp}
                </div>
              )}
            </div>
            <input
              name="address1"
              placeholder="Enter Your Address line 1"
              value={form.address1}
              onChange={handleChange}
              className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="address2"
              placeholder="Enter Your Address line 2"
              value={form.address2}
              onChange={handleChange}
              className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="address3"
              placeholder="Enter Your Address line 3"
              value={form.address3}
              onChange={handleChange}
              className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="w-full bg-white text-center font-bold text-black py-2 my-2 border border-gray-200">
              Below are optional
            </div>
            <div className="w-full mb-2">
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.email && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.email}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="SnapChat"
                placeholder="https://SnapChat"
                value={form.SnapChat}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.SnapChat
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.SnapChat && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.SnapChat}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Instagram"
                placeholder="https://Instagram"
                value={form.Instagram}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Instagram
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Instagram && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Instagram}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Linkedin"
                placeholder="https://Linkedin"
                value={form.Linkedin}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Linkedin
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Linkedin && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Linkedin}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Youtube"
                placeholder="https://Youtube"
                value={form.Youtube}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Youtube
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Youtube && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Youtube}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Facebook"
                placeholder="https://Facebook"
                value={form.Facebook}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Facebook
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Facebook && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Facebook}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="WeChat"
                placeholder="https://Wechat"
                value={form.WeChat}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.WeChat ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.WeChat && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.WeChat}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Twitter"
                placeholder="https://X"
                value={form.Twitter}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Twitter
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Twitter && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Twitter}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="Line"
                placeholder="https://Line"
                value={form.Line}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.Line ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.Line && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.Line}
                </div>
              )}
            </div>
            <div className="w-full mb-2">
              <input
                name="TikTok"
                placeholder="https://Tiktok"
                value={form.TikTok}
                onChange={handleChange}
                className={`w-full rounded-full px-3 py-2 border ${
                  validationErrors.TikTok ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
              {validationErrors.TikTok && (
                <div className="text-red-500 text-xs mt-1 px-2">
                  {validationErrors.TikTok}
                </div>
              )}
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
              className="mt-4 w-full bg-pink-600 text-white py-2 rounded-full font-bold text-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
