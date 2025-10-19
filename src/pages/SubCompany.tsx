import Layout from "../components/Layout";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import chamberIcon from "../assets/chamber.svg";
import profileIcon from "../assets/profileIcon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faTelegram,
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import leftArrow from "../assets/left-arrow.png";
import rightArrow from "../assets/right-arrow.png";
import { formatUrl, getUrlError, getEmailError } from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import i18n from "../i18n";

export default function SubCompanyPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const companyProfile = companies[currentCompanyIndex] || null;
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<null | "create" | "update">(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Top and bottom icon carousel refs & state
  const topIconsRef = useRef<HTMLDivElement | null>(null);
  const [showTopArrows, setShowTopArrows] = useState(false);
  const [canTopLeft, setCanTopLeft] = useState(false);
  const [canTopRight, setCanTopRight] = useState(false);

  const updateTopScroll = () => {
    const el = topIconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowTopArrows(overflow);
    setCanTopLeft(el.scrollLeft > 8);
    setCanTopRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateTopScroll();
    const onResize = () => {
      updateTopScroll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [companyProfile]);

  // Fetch company profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login again.");
        const res = await axios.get(`${API_BASE_URL}/getcompanyprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        {
          /* Combined name pill: English above, Chinese below (same spot) */
        }
        const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data.data || null);
        // Try different possible response structures
        let profileData = null;
        if (res.data && res.data.data) {
          profileData = res.data.data;
        } else if (res.data && typeof res.data === "object") {
          profileData = res.data;
        } else if (res.data && res.data.company) {
          profileData = res.data.company;
        }

        // If array, set all companies; else, wrap single object in array
        if (Array.isArray(profileData) && profileData.length > 0) {
          // Sort by company_order / order ascending to honor display order
          const sorted = [...profileData].sort((a: any, b: any) => {
            const ao = Number(a.company_order ?? a.order ?? 0);
            const bo = Number(b.company_order ?? b.order ?? 0);
            return ao - bo;
          });
          setCompanies(sorted);
          setCurrentCompanyIndex(0);
        } else if (profileData && typeof profileData === "object") {
          setCompanies([profileData]);
          setCurrentCompanyIndex(0);
        } else {
          setCompanies([]);
          setCurrentCompanyIndex(0);
        }
      } catch (err: any) {
        setCompanies([]);
        setCurrentCompanyIndex(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Open edit form for update
  const openEditProfile = () => {
    setEditMode("update");
    setEditProfile(companyProfile);
    setEditError("");
  };
  // Open edit form for create
  const openCreateProfile = () => {
    setEditMode("create");
    setEditProfile({});
    setEditError("");
  };
  // Handle edit form input
  const handleEditInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }

    // Real-time validation for email
    if (name === "email") {
      const emailError = getEmailError(value);
      if (emailError) {
        setValidationErrors({ ...validationErrors, [name]: emailError });
      }
    }

    // Real-time validation for URL fields
    const urlFields = [
      "website",
      "telegramId",
      "WhatsApp",
      "facebook",
      "instagram",
      "youtube",
    ];

    if (urlFields.includes(name)) {
      const urlError = getUrlError(value, name);
      if (urlError) {
        setValidationErrors({ ...validationErrors, [name]: urlError });
      }
    }

    setEditProfile({ ...editProfile, [name]: value });
  };
  // Handle edit form file
  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (
        selectedFile.type.startsWith("video/") &&
        selectedFile.type !== "video/mp4"
      ) {
        setEditError("Only MP4 video files are allowed.");
        setFile(null);
        setFilePreview(null);
        return;
      }

      setEditError("");
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));

      const reader = new FileReader();
      reader.onload = () => {
        setEditProfile((prev: any) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  // Save handler for both create and update
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    // Validate all fields before submission
    const errors: { [key: string]: string } = {};

    // Validate email
    if (editProfile.email) {
      const emailError = getEmailError(editProfile.email);
      if (emailError) errors.email = emailError;
    }

    // Validate all URL fields
    const urlFields = {
      website: editProfile.website,
      telegramId: editProfile.telegramId,
      WhatsApp: editProfile.WhatsApp,
      facebook: editProfile.facebook,
      instagram: editProfile.instagram,
      youtube: editProfile.youtube,
    };

    Object.entries(urlFields).forEach(([field, value]) => {
      if (value) {
        const urlError = getUrlError(value, field);
        if (urlError) errors[field] = urlError;
      }
    });

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setEditError("Please fix the validation errors before submitting.");
      setEditLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      const formData = new FormData();
      formData.append(
        "company_name_english",
        editProfile.company_name_english || ""
      );
      formData.append(
        "company_name_chinese",
        editProfile.company_name_chinese || ""
      );
      formData.append(
        "companydesignation",
        editProfile.companydesignation || ""
      );
      formData.append("telegramId", editProfile.telegramId || "");
      formData.append("description", editProfile.description || "");
      formData.append("email", editProfile.email || "");
      formData.append("WhatsApp", editProfile.WhatsApp || "");
      formData.append("website", editProfile.website || "");
      formData.append("facebook", editProfile.facebook || "");
      if (editProfile.image && editProfile.image.startsWith("data:image")) {
        // Convert base64 to blob and append
        const arr = editProfile.image.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        formData.append("image", new Blob([u8arr], { type: mime }));
      }
      await axios.post(`${API_BASE_URL}/companyprofile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh company data with fresh GET call
      const res = await axios.get(`${API_BASE_URL}/getcompanyprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Try different possible response structures
      let profileData = null;
      if (res.data && res.data.data) {
        profileData = res.data.data;
      } else if (res.data && typeof res.data === "object") {
        profileData = res.data;
      } else if (res.data && res.data.company) {
        profileData = res.data.company;
      }

      // Handle array response - if profileData is an array, take the first item
      if (Array.isArray(profileData) && profileData.length > 0) {
        profileData = profileData[0];
      }

      if (
        profileData &&
        typeof profileData === "object" &&
        !Array.isArray(profileData)
      ) {
        setCompanies([profileData]);
        setCurrentCompanyIndex(0);
      } else {
        setCompanies([]);
        setCurrentCompanyIndex(0);
      }

      setEditMode(null);
      setEditProfile(null);
      setFile(null);
      setFilePreview(null);
      setValidationErrors({});
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save company profile"
      );
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <section className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : editMode ? (
            <form
              onSubmit={handleEditSave}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold mb-4 text-center">
                {editMode === "update"
                  ? i18n.t("company_update_title")
                  : i18n.t("company_create_title")}
              </h2>
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="company_name_english"
                placeholder={i18n.t("placeholder_company_english")}
                value={editProfile?.company_name_english || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="company_name_chinese"
                placeholder={i18n.t("placeholder_company_chinese")}
                value={editProfile?.company_name_chinese || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="companydesignation"
                placeholder={i18n.t("placeholder_designation")}
                value={editProfile?.companydesignation || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {/* Image/Video Preview and Upload */}
              <div className="flex flex-col items-center mb-4 w-full">
                <div
                  className="rounded-xl flex items-center justify-center mb-4 cursor-pointer"
                  onClick={() =>
                    document.getElementById("company-file-input")?.click()
                  }
                  style={{ width: 180, height: 180 }}
                >
                  {filePreview ? (
                    file?.type.startsWith("video/") ? (
                      <video
                        src={filePreview}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-[180px] h-[180px] object-cover rounded-xl"
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-[180px] h-[180px] object-cover rounded-xl"
                      />
                    )
                  ) : editProfile?.image &&
                    editProfile.image.startsWith("data:image") ? (
                    <img
                      src={editProfile.image}
                      alt="company"
                      className="w-[180px] h-[180px] object-cover rounded-xl"
                    />
                  ) : editProfile?.image &&
                    editProfile.image.endsWith(".mp4") ? (
                    <video
                      src={editProfile.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-[180px] h-[180px] object-cover rounded-xl"
                    />
                  ) : editProfile?.image ? (
                    <img
                      src={editProfile.image}
                      alt="company"
                      className="w-[180px] h-[180px] object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] bg-blue-400 rounded-xl flex items-center justify-center">
                      <div className="text-white text-center text-sm font-semibold whitespace-pre-line px-4">
                        {i18n.t("please_upload")}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="company-file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleEditFile}
                  disabled={editLoading}
                  className="hidden"
                />
              </div>
              <textarea
                className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full h-48 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 resize-none"
                name="description"
                placeholder="Company Description"
                value={editProfile?.description || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.email
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={editProfile?.email || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.email && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.email}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.website
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="website"
                  placeholder="Website"
                  value={editProfile?.website || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.website && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.website}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.WhatsApp
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="WhatsApp"
                  placeholder="WhatsApp"
                  value={editProfile?.WhatsApp || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.WhatsApp && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.WhatsApp}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.telegramId
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="telegramId"
                  placeholder="Telegram ID"
                  value={editProfile?.telegramId || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.telegramId && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.telegramId}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.facebook
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="facebook"
                  placeholder="https://Facebook"
                  value={editProfile?.facebook || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.facebook && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.facebook}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.instagram
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="instagram"
                  placeholder="https://Instagram"
                  value={editProfile?.instagram || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.instagram && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.instagram}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.youtube
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="youtube"
                  placeholder="https://Youtube"
                  value={editProfile?.youtube || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.youtube && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.youtube}
                  </div>
                )}
              </div>
              {editError && (
                <div className="text-red-500 mb-2 text-center">{editError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50 mt-2"
                disabled={
                  editLoading ||
                  (editProfile?.order !== undefined &&
                    (Number(editProfile.order) < 0 ||
                      Number(editProfile.order) > companies.length))
                }
              >
                {editLoading
                  ? editMode === "update"
                    ? i18n.t("updating")
                    : i18n.t("saving")
                  : editMode === "update"
                  ? i18n.t("update")
                  : i18n.t("save")}
              </button>
              {/* Cancel button below Update/Save in edit mode */}
              <button
                type="button"
                className="w-full bg-black text-white rounded-full py-2 font-bold mt-2"
                onClick={() => {
                  setEditMode(null);
                  setEditProfile(null);
                  setEditError("");
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
            </form>
          ) : companyProfile ? (
            <>
              {/* Top Icon Carousel: personal profile, whatsapp, telegram, phone, chamber */}
              <div className="relative w-full mb-4">
                <button
                  aria-label="Top scroll left"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-1 bg-white/10 rounded-full ${
                    canTopLeft
                      ? "opacity-100"
                      : "opacity-30 pointer-events-none"
                  }`}
                  onClick={() => {
                    const el = topIconsRef.current;
                    if (!el) return;
                    el.scrollBy({
                      left: -el.clientWidth * 0.6,
                      behavior: "smooth",
                    });
                    setTimeout(updateTopScroll, 300);
                  }}
                  style={{ display: showTopArrows ? "block" : "none" }}
                >
                  <img src={leftArrow} alt="left" className="w-6 h-6" />
                </button>
                <div
                  ref={topIconsRef}
                  onScroll={updateTopScroll}
                  className="flex gap-4 px-4 overflow-x-hidden items-center"
                  style={{
                    scrollBehavior: "smooth",
                    scrollSnapType: "x mandatory" as any,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => navigate("/profile")}
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <img
                      src={profileIcon}
                      alt="Profile"
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  {profile?.WhatsApp ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      onClick={() =>
                        window.open(formatUrl(profile.WhatsApp), "_blank")
                      }
                      style={{
                        backgroundColor: "var(--app-background-color)",
                        scrollSnapAlign: "center" as any,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        size="2x"
                        color="white"
                      />
                    </div>
                  ) : null}
                  {profile?.tgid ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      onClick={() =>
                        window.open(formatUrl(profile.tgid), "_blank")
                      }
                      style={{
                        backgroundColor: "var(--app-background-color)",
                        scrollSnapAlign: "center" as any,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTelegram}
                        size="2x"
                        color="white"
                      />
                    </div>
                  ) : null}
                  {profile?.contact ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      onClick={() =>
                        window.open(`tel:${profile.contact}`, "_self")
                      }
                      style={{
                        backgroundColor: "var(--app-background-color)",
                        scrollSnapAlign: "center" as any,
                      }}
                    >
                      <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                    </div>
                  ) : null}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => navigate("/chamber")}
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <img
                      src={chamberIcon}
                      alt="chamber icon"
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                </div>
                <button
                  aria-label="Top scroll right"
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-1 bg-white/10 rounded-full ${
                    canTopRight
                      ? "opacity-100"
                      : "opacity-30 pointer-events-none"
                  }`}
                  onClick={() => {
                    const el = topIconsRef.current;
                    if (!el) return;
                    el.scrollBy({
                      left: el.clientWidth * 0.6,
                      behavior: "smooth",
                    });
                    setTimeout(updateTopScroll, 300);
                  }}
                  style={{ display: showTopArrows ? "block" : "none" }}
                >
                  <img src={rightArrow} alt="right" className="w-4 h-auto" />
                </button>
              </div>

              {/* Company Names with navigation arrows (overlay, name stays full-width) */}
              <div className="relative w-full mb-2">
                <div
                  className="w-full rounded-full bg-app text-app text-xl font-bold py-1 flex items-center justify-center"
                  style={{ borderRadius: "2rem" }}
                >
                  {companyProfile.company_name_english ||
                    "English Company Name"}
                </div>
                <button
                  aria-label="Prev company"
                  className="absolute left-0 -translate-x-1/2 p-1 rounded-full"
                  style={{
                    top: "calc(50% + 2px)",
                    display: currentCompanyIndex > 0 ? "block" : "none",
                  }}
                  onClick={() =>
                    setCurrentCompanyIndex((i) => Math.max(i - 1, 0))
                  }
                >
                  <img src={leftArrow} alt="prev" className="w-6 h-6" />
                </button>
                <button
                  aria-label="Next company"
                  className="absolute right-0 translate-x-1/2 p-1 rounded-full"
                  style={{
                    top: "calc(50% + 2px)",
                    display:
                      currentCompanyIndex < companies.length - 1
                        ? "block"
                        : "none",
                  }}
                  onClick={() =>
                    setCurrentCompanyIndex((i) =>
                      Math.min(i + 1, companies.length - 1)
                    )
                  }
                >
                  <img src={rightArrow} alt="next" className="w-6 h-6" />
                </button>
              </div>
              <div
                className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-2 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {companyProfile.company_name_chinese || "中文公司名稱"}
              </div>
              <div
                className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-4 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {companyProfile.companydesignation || "Company Designation"}
              </div>

              {/* Company Image and Description */}
              <div className="flex flex-col items-center mb-6 w-full">
                {/* Image container - matching ChamberPage style */}
                <div className="w-full flex justify-center mb-4">
                  <div
                    className="rounded-xl p-2 flex items-center justify-center w-full"
                    style={{ height: 200 }}
                  >
                    <img
                      src={companyProfile.image || profileIcon}
                      alt="Company Logo"
                      className="mx-auto rounded-md w-[60%] h-full object-cover object-center block"
                      style={{ maxWidth: "60%" }}
                    />
                  </div>
                </div>
                <div
                  className="w-full h-48 bg-white rounded-md p-2 overflow-auto"
                  style={{
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: "var(--app-background-color)",
                  }}
                >
                  {companyProfile.description || "No description available"}
                </div>
              </div>

              {/* Bottom Icons: fixed 5 octagonal icons (Telegram, Facebook, Instagram, YouTube, Website) */}
              <div className="w-full mb-6 flex items-center justify-between gap-3">
                {[
                  {
                    key: "telegram",
                    enabled: !!companyProfile?.telegramId,
                    render: () => (
                      <FontAwesomeIcon
                        icon={faTelegram}
                        size="lg"
                        color="white"
                      />
                    ),
                    onClick: () => {
                      if (companyProfile?.telegramId) {
                        const id = (companyProfile.telegramId || "").replace(
                          /^@/,
                          ""
                        );
                        window.open(`https://t.me/${id}`, "_blank");
                      }
                    },
                  },
                  ...(companyProfile?.facebook
                    ? [
                        {
                          key: "facebook",
                          enabled: true,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faFacebook}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            window.open(
                              formatUrl(companyProfile.facebook),
                              "_blank"
                            );
                          },
                        },
                      ]
                    : []),
                  ...(companyProfile?.instagram
                    ? [
                        {
                          key: "instagram",
                          enabled: true,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faInstagram}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            window.open(
                              formatUrl(companyProfile.instagram),
                              "_blank"
                            );
                          },
                        },
                      ]
                    : []),
                  ...(companyProfile?.youtube
                    ? [
                        {
                          key: "youtube",
                          enabled: true,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faYoutube}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            window.open(
                              formatUrl(companyProfile.youtube),
                              "_blank"
                            );
                          },
                        },
                      ]
                    : []),
                  {
                    key: "website",
                    enabled: !!companyProfile?.website,
                    render: () => (
                      <FontAwesomeIcon icon={faGlobe} size="lg" color="white" />
                    ),
                    onClick: () => {
                      if (companyProfile?.website)
                        window.open(
                          formatUrl(companyProfile.website),
                          "_blank"
                        );
                    },
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`w-12 h-12 flex-shrink-0 ${
                      item.enabled
                        ? "cursor-pointer"
                        : "opacity-40 pointer-events-none"
                    }`}
                    onClick={item.onClick}
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      backgroundColor: "var(--app-background-color)",
                      padding: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        clipPath:
                          "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    >
                      {item.render()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center w-full gap-4 text-center mt-6">
                <button
                  className="p-2 w-full text-white bg-[#d50078] shadow-md rounded-full"
                  onClick={openEditProfile}
                >
                  {i18n.t("update")}
                </button>
                <button
                  className="p-2 w-full text-white bg-[#009944] shadow-md rounded-full"
                  onClick={openCreateProfile}
                >
                  {i18n.t("add_more")}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              No company profile found.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
