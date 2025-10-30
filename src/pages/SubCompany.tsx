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
import {
  faPhone,
  faGlobe,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { callOrCopyPhone } from "../utils/phone";
import {
  formatUrl,
  getUrlError,
  getEmailError,
  formatImageUrl,
} from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import i18n from "../i18n";
import WebApp from "@twa-dev/sdk";

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
  const [occupiedOrders, setOccupiedOrders] = useState<number[]>([]);

  // Update occupied orders when companies change
  useEffect(() => {
    const orders = (companies || [])
      .map((c: any) => Number(c.company_order ?? c.order ?? -1))
      .filter((n: number) => !isNaN(n) && n > 0 && n <= 20);
    setOccupiedOrders(orders);
  }, [companies]);

  // Top and bottom icon carousel refs & state
  const topIconsRef = useRef<HTMLDivElement | null>(null);

  const updateTopScroll = () => {
    const el = topIconsRef.current;
    if (!el) return;
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

        // If array with items, set all companies; else, if a single object (not an array) wrap it in an array
        if (Array.isArray(profileData) && profileData.length > 0) {
          // Sort by company_order / order ascending to honor display order
          const sorted = [...profileData].sort((a: any, b: any) => {
            const ao = Number(a.company_order ?? a.order ?? 0);
            const bo = Number(b.company_order ?? b.order ?? 0);
            return ao - bo;
          });
          setCompanies(sorted);
          setCurrentCompanyIndex(0);
        } else if (
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
      } catch (err: any) {
        setCompanies([]);
        setCurrentCompanyIndex(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Delete company profile
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to handle company deletion
  const deleteCompany = async () => {
    if (!companyProfile?._id) {
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      // Call the delete company API
      await axios.delete(
        `${API_BASE_URL}/deletecompany/${companyProfile._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // After successful delete, fetch all companies from server to refresh state
      try {
        const res = await axios.get(`${API_BASE_URL}/getcompanyprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let profileData: any = null;
        if (res.data && res.data.data) {
          profileData = res.data.data;
        } else if (res.data && typeof res.data === "object") {
          profileData = res.data;
        } else if (res.data && res.data.company) {
          profileData = res.data.company;
        }

        // Only treat as "has companies" when profileData is a non-empty array
        if (Array.isArray(profileData) && profileData.length > 0) {
          const sorted = [...profileData].sort((a: any, b: any) => {
            const ao = Number(a.company_order ?? a.order ?? 0);
            const bo = Number(b.company_order ?? b.order ?? 0);
            return ao - bo;
          });
          setCompanies(sorted);
          setCurrentCompanyIndex(0);
        } else if (
          profileData &&
          typeof profileData === "object" &&
          !Array.isArray(profileData)
        ) {
          setCompanies([profileData]);
          setCurrentCompanyIndex(0);
        } else {
          // empty array or null -> no companies
          setCompanies([]);
          setCurrentCompanyIndex(0);
        }
      } catch (err) {
        // If refresh fails, fall back to removing locally
        const updatedCompanies = companies.filter(
          (c) => c._id !== companyProfile._id
        );
        setCompanies(updatedCompanies);
        setCurrentCompanyIndex(0);
      }

      // Show success feedback and close modal / edit mode
      setSuccessMessage("Company deleted successfully.");
      setEditMode(null);
      setEditProfile(null);
      setFile(null);
      setFilePreview(null);
      setValidationErrors({});
      setShowDeleteConfirm(false);

      // Auto-hide success message after 3s
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error deleting company:", err);
      setEditError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete company"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open edit form for update
  const openEditProfile = () => {
    setEditMode("update");
    // Prefill editProfile with mapped fields from companyProfile
    const mapped = {
      company_name_english: companyProfile?.company_name_english || "",
      company_name_chinese: companyProfile?.company_name_chinese || "",
      companydesignation: companyProfile?.companydesignation || "",
      description: companyProfile?.description || "",
      email: companyProfile?.email || "",
      WhatsApp: companyProfile?.WhatsApp || "",
      Instagram: companyProfile?.Instagram || "",
      Facebook: companyProfile?.Facebook || "",
      Youtube: companyProfile?.Youtube || "",
      telegramId: companyProfile?.telegramId || "",
      website: companyProfile?.website || "",
      order: companyProfile?.company_order ?? companyProfile?.order ?? "",
      image: companyProfile?.image || companyProfile?.video || "",
      video: companyProfile?.video || "",
    };
    setEditProfile(mapped);
    // If there's an image URL, show it as the preview (no local file selected)
    if (mapped.image) {
      setFile(null);
      setFilePreview(formatImageUrl(mapped.image));
    } else {
      setFilePreview(null);
    }
    setEditError("");
  };
  // Open edit form for create
  const openCreateProfile = () => {
    // Redirect to the dedicated create-company page
    navigate("/create-company");
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
      "Facebook",
      "Instagram",
      "Youtube",
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

      const isPremium = profile?.membertype === "premium";

      // Check if file is a video
      if (selectedFile.type.startsWith("video/")) {
        if (!isPremium) {
          setEditError("Video upload is only available for premium members.");
          setFile(null);
          setFilePreview(null);
          return;
        }
        if (selectedFile.type !== "video/mp4") {
          setEditError("Only MP4 video files are allowed.");
          setFile(null);
          setFilePreview(null);
          return;
        }
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
      Facebook: editProfile.Facebook,
      Instagram: editProfile.Instagram,
      Youtube: editProfile.Youtube,
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

      // Build the company document matching backend structure
      const companyDoc: any = {
        company_name_english: editProfile.company_name_english || "",
        company_name_chinese: editProfile.company_name_chinese || "",
        companydesignation: editProfile.companydesignation || "",
        description: editProfile.description || "",
        email: editProfile.email || "",
        WhatsApp: editProfile.WhatsApp || "",
        Instagram: editProfile.Instagram || "",
        Facebook: editProfile.Facebook || "",
        Youtube: editProfile.Youtube || "",
        telegramId: editProfile.telegramId || "",
        website: editProfile.website || "",
        company_order:
          editProfile.order !== undefined && editProfile.order !== ""
            ? editProfile.order
            : companyProfile?.company_order ?? 0,
      };

      // Only include image if it's a new base64 upload (user changed the image)
      // Don't send existing image URL as it will break the backend
      if (editProfile.image && editProfile.image.startsWith("data:")) {
        companyDoc.image = editProfile.image;
      }

      // Video field (if needed for premium users in future)
      if (editProfile.video && editProfile.video.startsWith("data:")) {
        companyDoc.video = editProfile.video;
      }

      // If we're updating an existing company, include its _id
      if (editMode === "update" && companyProfile?._id) {
        companyDoc._id = companyProfile._id;
      }

      // Send as JSON with data array structure
      await axios.post(
        `${API_BASE_URL}/updatecompany`,
        { data: [companyDoc] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

      // If the API returned an array of companies, sort and set them.
      if (Array.isArray(profileData) && profileData.length > 0) {
        const sorted = [...profileData].sort((a: any, b: any) => {
          const ao = Number(a.company_order ?? a.order ?? 0);
          const bo = Number(b.company_order ?? b.order ?? 0);
          return ao - bo;
        });
        setCompanies(sorted);
        setCurrentCompanyIndex(0);
      } else if (
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
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md z-50">
          {successMessage}
        </div>
      )}
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
                  className="w-full rounded-xl flex items-center justify-center mb-4 cursor-pointer h-48"
                  onClick={() =>
                    document.getElementById("company-file-input")?.click()
                  }
                >
                  {filePreview ? (
                    file?.type.startsWith("video/") ? (
                      <video
                        src={filePreview}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    )
                  ) : editProfile?.image &&
                    editProfile.image.startsWith("data:image") ? (
                    <img
                      src={editProfile.image}
                      alt="company"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : editProfile?.image &&
                    editProfile.image.endsWith(".mp4") ? (
                    <video
                      src={editProfile.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : editProfile?.image ? (
                    <img
                      src={editProfile.image}
                      alt="company"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-blue-400 rounded-xl flex items-center justify-center">
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
                {/* Browse / Cancel buttons to match CreateCompanyPage UX */}
                <div className="flex gap-4 mb-4 w-full">
                  <button
                    type="button"
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex-1"
                    onClick={() =>
                      document.getElementById("company-file-input")?.click()
                    }
                    disabled={editLoading}
                  >
                    Browse
                  </button>
                  <button
                    type="button"
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex-1"
                    onClick={() => {
                      // Revert selection to original company media (if any)
                      setFile(null);
                      // restore preview to original company image/video URL when available
                      setFilePreview(
                        companyProfile?.image
                          ? formatImageUrl(companyProfile.image)
                          : companyProfile?.video
                          ? companyProfile.video
                          : null
                      );
                      setEditProfile((prev: any) => ({
                        ...prev,
                        image:
                          companyProfile?.image || companyProfile?.video || "",
                      }));
                      const el = document.getElementById(
                        "company-file-input"
                      ) as HTMLInputElement | null;
                      if (el) el.value = "";
                    }}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                </div>
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
                    validationErrors.Facebook
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="Facebook"
                  placeholder="Facebook URL"
                  value={editProfile?.Facebook || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.Facebook && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.Facebook}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.Instagram
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="Instagram"
                  placeholder="Instagram URL"
                  value={editProfile?.Instagram || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.Instagram && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.Instagram}
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                    validationErrors.Youtube
                      ? "border-red-500"
                      : "border-blue-200"
                  }`}
                  type="text"
                  name="Youtube"
                  placeholder="Youtube URL"
                  value={editProfile?.Youtube || ""}
                  onChange={handleEditInput}
                  disabled={editLoading}
                />
                {validationErrors.Youtube && (
                  <div className="text-red-500 text-xs mb-2 px-2">
                    {validationErrors.Youtube}
                  </div>
                )}
              </div>
              <div className="w-full mb-2">
                <label className="block text-sm mb-1">Display Order</label>
                <select
                  name="order"
                  value={editProfile?.order || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditProfile({ ...editProfile, order: v });
                    if (validationErrors["order"])
                      setValidationErrors({ ...validationErrors, order: "" });
                  }}
                  disabled={editLoading}
                  className="w-full rounded-full px-4 py-2 mb-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option
                      key={n}
                      value={String(n)}
                      disabled={
                        occupiedOrders.includes(n) &&
                        Number(editProfile?.order) !== n
                      }
                    >
                      {n}
                      {occupiedOrders.includes(n) &&
                      Number(editProfile?.order) !== n
                        ? " (taken)"
                        : ""}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-black mt-1">
                  Numbers marked "(taken)" are already used by other companies
                  and are disabled.
                </div>
              </div>
              {/* Range validation removed per request - allow any value selection */}
              {editError && (
                <div className="text-red-500 mb-2 text-center">{editError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50 mt-2"
                disabled={editLoading}
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
              {/* Delete button inside edit mode (only for updates) */}
              {editMode === "update" && (
                <button
                  type="button"
                  className="w-full bg-red-600 text-white rounded-full py-2 font-bold mt-2"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteLoading || editLoading}
                >
                  Delete Company
                </button>
              )}
            </form>
          ) : companyProfile ? (
            <>
              {/* Top Icon Carousel: personal profile, whatsapp, telegram, phone, chamber */}
              <div className="relative w-full mb-4">
                <div
                  ref={topIconsRef}
                  onScroll={updateTopScroll}
                  className="flex gap-3 px-2 overflow-x-hidden items-center no-scrollbar"
                  style={{
                    scrollBehavior: "smooth",
                    scrollSnapType: "x mandatory" as any,
                  }}
                >
                  {/* Top icons: profile, WhatsApp, Telegram, Phone, Chamber */}
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
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
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
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
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
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                      onClick={() => callOrCopyPhone(String(profile.contact))}
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
              </div>

              {/* Company Names with navigation arrows */}
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
                  <FontAwesomeIcon icon={faChevronLeft} color="red" />
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
                  <FontAwesomeIcon icon={faChevronRight} color="red" />
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
                {/* Image container */}
                <div className="w-full flex justify-center mb-4">
                  {companyProfile.image?.endsWith(".mp4") ? (
                    <video
                      src={formatImageUrl(companyProfile.image)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <img
                      src={formatImageUrl(companyProfile.image) || profileIcon}
                      alt="Company Logo"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}
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
                        WebApp.openLink(`https://t.me/${id}`);
                      }
                    },
                  },
                  ...(companyProfile?.Facebook || companyProfile?.facebook
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
                            const url =
                              companyProfile.Facebook ||
                              companyProfile.facebook;
                            window.open(formatUrl(url), "_blank");
                          },
                        },
                      ]
                    : []),
                  ...(companyProfile?.Instagram || companyProfile?.instagram
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
                            const url =
                              companyProfile.Instagram ||
                              companyProfile.instagram;
                            WebApp.openLink(formatUrl(url));
                          },
                        },
                      ]
                    : []),
                  ...(companyProfile?.Youtube || companyProfile?.youtube
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
                            const url =
                              companyProfile.Youtube || companyProfile.youtube;
                            WebApp.openLink(formatUrl(url));
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
              <div className="flex justify-center w-full gap-3 text-center mt-6">
                <button
                  className="p-2 flex-1 text-white bg-[#d50078] shadow-md rounded-full"
                  onClick={openEditProfile}
                >
                  {i18n.t("update")}
                </button>
                <button
                  className="p-2 flex-1 text-white bg-[#009944] shadow-md rounded-full"
                  onClick={openCreateProfile}
                >
                  {i18n.t("add_more")}
                </button>
                {/* Delete action is available only in the update/edit screen */}
              </div>
            </>
          ) : (
            <div className=" flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-4 text-center max-w-sm">
                You don't have any company profiles yet. Add a company to
                display it here.
              </p>
              <button
                className="px-6 py-2 bg-[#009944] text-white rounded-full font-bold"
                onClick={openCreateProfile}
              >
                Add Company
              </button>
            </div>
          )}
        </section>
      </div>
      {/* Delete Confirmation Modal (rendered globally within this component) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center">
              Delete Company?
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete this company? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 p-2 bg-gray-300 rounded-md"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="flex-1 p-2 bg-red-500 text-white rounded-md"
                onClick={deleteCompany}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
