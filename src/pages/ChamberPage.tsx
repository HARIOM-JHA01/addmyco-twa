import Layout from "../components/Layout";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CompanyLogo from "../assets/company.svg";
// left/right asset removed; using FontAwesome arrows instead
import ProfileIcon from "../assets/profileIcon.png";
import logo from "../assets/logo.png";
import {
  faWhatsapp,
  faTelegram,
  faYoutube,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import {
  faGlobe,
  faPhone,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WebApp from "@twa-dev/sdk";
import i18n from "../i18n";
import { formatUrl, getUrlError } from "../utils/validation";
import { callOrCopyPhone } from "../utils/phone";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ChamberPage() {
  const navigate = useNavigate();
  const [currentChamberIndex, setCurrentChamberIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [chamberData, setChamberData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<null | "create" | "update">(null);
  const [editChamber, setEditChamber] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Delete chamber state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Icon carousel refs & state for chamber page
  const topIconsRef = useRef<HTMLDivElement | null>(null);
  const bottomIconsRef = useRef<HTMLDivElement | null>(null);

  const updateTopScroll = () => {
    const el = topIconsRef.current;
    if (!el) return;
  };

  const updateBottomScroll = () => {
    const el = bottomIconsRef.current;
    if (!el) return;
  };

  useEffect(() => {
    updateTopScroll();
    updateBottomScroll();
    const onResize = () => {
      updateTopScroll();
      updateBottomScroll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [chamberData]);

  // normalize common profile contact fields to handle different naming conventions
  const whatsappLink = profile?.WhatsApp || profile?.whatsapp || null;
  const telegramLink = profile?.telegramId || profile?.tgid || null;
  const contactNumber =
    profile?.contact || profile?.Contact || profile?.phone || null;
  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Open edit form for update
  const openEditChamber = (chamber: any) => {
    setEditMode("update");
    setEditChamber({
      enName: chamber.chamber_name_english,
      cnName: chamber.chamber_name_chinese,
      designation: chamber.chamberdesignation,
      details: chamber.detail,
      website: chamber.chamberwebsite,
      telegram: chamber.tgchannel,
      instagram: chamber.Instagram,
      youtube: chamber.Youtube,
      facebook: chamber.Facebook,
      order: chamber.chamber_order,
      _id: chamber._id,
      image: chamber.image,
      whatsapp: chamber.WhatsApp,
      wechat: chamber.WeChat,
      line: chamber.Line,
      twitter: chamber.Twitter,
      linkedin: chamber.Linkedin,
      snapchat: chamber.SnapChat,
      skype: chamber.Skype,
      tiktok: chamber.TikTok,
      tgchannel: chamber.tgchannel,
      chamberfanpage: chamber.chamberfanpage,
    });
    setFile(null);
    setEditError("");
  };

  // Function to handle chamber deletion
  const deleteChamber = async () => {
    const currentChamber = Array.isArray(chamberData)
      ? chamberData[currentChamberIndex]
      : chamberData;

    if (!currentChamber?._id) {
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      // Call the delete chamber API
      await axios.delete(
        `${API_BASE_URL}/deletechamber/${currentChamber._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // After successful delete, fetch all chambers from server to refresh state
      try {
        const res = await axios.get(`${API_BASE_URL}/getchamberprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data || res.data;

        // Check if data is array with items
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => {
            const ao = Number(a.chamber_order ?? a.order ?? 0);
            const bo = Number(b.chamber_order ?? b.order ?? 0);
            return ao - bo;
          });
          setChamberData(sorted);
          setCurrentChamberIndex(0);
        } else if (data && typeof data === "object" && !Array.isArray(data)) {
          setChamberData([data]);
          setCurrentChamberIndex(0);
        } else {
          // empty array or null -> no chambers
          setChamberData(null);
          setCurrentChamberIndex(0);
        }
      } catch (err) {
        // If refresh fails, fall back to removing locally
        if (Array.isArray(chamberData)) {
          const updatedChambers = chamberData.filter(
            (c) => c._id !== currentChamber._id
          );
          setChamberData(updatedChambers.length > 0 ? updatedChambers : null);
          setCurrentChamberIndex(0);
        } else {
          setChamberData(null);
        }
      }

      // Show success feedback and close modal / edit mode
      setSuccessMessage("Chamber deleted successfully.");
      setEditMode(null);
      setEditChamber(null);
      setFile(null);
      setFilePreview(null);
      setValidationErrors({});
      setShowDeleteConfirm(false);

      // Auto-hide success message after 3s
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error deleting chamber:", err);
      setEditError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete chamber"
      );
    } finally {
      setDeleteLoading(false);
    }
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

    // Validation for chamber_order (display order)
    if (name === "order") {
      const chambersCount = Array.isArray(chamberData) ? chamberData.length : 0;
      const numValue = Number(value);
      if (value === "") {
        setEditError("");
      } else if (isNaN(numValue) || numValue < 0 || numValue >= chambersCount) {
        setEditError(
          `Display order must be between 0 and ${chambersCount - 1}`
        );
      } else {
        setEditError("");
      }
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

    setEditChamber({ ...editChamber, [name]: value });
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

      const base64 = await fileToBase64(selectedFile);
      setEditChamber((prev: any) => ({ ...prev, image: base64 }));
    }
  };
  // Save handler for both create and update
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    // Validate all URL fields before submission
    const errors: { [key: string]: string } = {};
    const urlFields = {
      website: editChamber?.website,
      tgchannel: editChamber?.tgchannel,
      instagram: editChamber?.instagram,
      youtube: editChamber?.youtube,
      facebook: editChamber?.facebook,
      whatsapp: editChamber?.whatsapp,
      wechat: editChamber?.wechat,
      line: editChamber?.line,
      twitter: editChamber?.twitter,
      linkedin: editChamber?.linkedin,
      snapchat: editChamber?.snapchat,
      skype: editChamber?.skype,
      tiktok: editChamber?.tiktok,
      chamberfanpage: editChamber?.chamberfanpage,
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
      WebApp.showAlert("Please fix the validation errors before submitting.");
      setEditLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      if (editMode === "update") {
        // Update
        const payload: any = {
          data: [
            {
              _id: editChamber._id,
              chamber_name_english: editChamber.enName,
              chamber_name_chinese: editChamber.cnName,
              chamberdesignation: editChamber.designation,
              chamberwebsite: editChamber.website,
              detail: editChamber.details,
              WhatsApp: editChamber.whatsapp,
              WeChat: editChamber.wechat,
              Line: editChamber.line,
              Instagram: editChamber.instagram,
              Facebook: editChamber.facebook,
              Twitter: editChamber.twitter,
              Youtube: editChamber.youtube,
              Linkedin: editChamber.linkedin,
              SnapChat: editChamber.snapchat,
              Skype: editChamber.skype,
              TikTok: editChamber.tiktok,
              tgchannel: editChamber.telegram,
              chamberfanpage: editChamber.chamberfanpage,
              chamber_order: editChamber.order,
            },
          ],
        };

        // Only include image if it's a new base64 upload (user changed the image)
        // Don't send existing image URL as it will break the backend
        if (editChamber.image && editChamber.image.startsWith("data:")) {
          payload.data[0].image = editChamber.image;
        }

        await axios.post(`${API_BASE_URL}/updatechamber`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // Create
        const formData = new FormData();
        formData.append("chamber_name_english", editChamber.enName);
        formData.append("chamber_name_chinese", editChamber.cnName);
        formData.append("chamberdesignation", editChamber.designation);
        formData.append("detail", editChamber.details);
        formData.append("chamberwebsite", editChamber.website);
        formData.append("WhatsApp", editChamber.whatsapp);
        formData.append("WeChat", editChamber.wechat);
        formData.append("Line", editChamber.line);
        formData.append("Instagram", editChamber.instagram);
        formData.append("Facebook", editChamber.facebook);
        formData.append("Twitter", editChamber.twitter);
        formData.append("Youtube", editChamber.youtube);
        formData.append("Linkedin", editChamber.linkedin);
        formData.append("SnapChat", editChamber.snapchat);
        formData.append("Skype", editChamber.skype);
        formData.append("TikTok", editChamber.tiktok);
        formData.append("tgchannel", editChamber.tgchannel);
        formData.append("chamberfanpage", editChamber.chamberfanpage);
        formData.append("order", editChamber.order);
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
      }

      // Refresh chamber data with fresh GET call
      const res = await axios.get(`${API_BASE_URL}/getchamber`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileRes.data.data || null);
      if (
        res.data &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        setChamberData(res.data.data);
      } else {
        setChamberData(null);
      }
      setEditMode(null);
      setEditChamber(null);
      setFile(null);
      setFilePreview(null);
      setValidationErrors({});
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message || err.message || "Failed to save chamber"
      );
    } finally {
      setEditLoading(false);
    }
  };
  useEffect(() => {
    const fetchChamber = async () => {
      setLoading(true);
      // removed unused: setFetchError
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login again.");
        const res = await axios.get(`${API_BASE_URL}/getchamber`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (
          res.data &&
          Array.isArray(res.data.data) &&
          res.data.data.length > 0
        ) {
          // Sort by chamber_order (numeric) ascending so display order is deterministic
          const sorted = [...res.data.data].sort((a: any, b: any) => {
            const ao = Number(a.chamber_order ?? a.order ?? 0);
            const bo = Number(b.chamber_order ?? b.order ?? 0);
            return ao - bo;
          });
          setChamberData(sorted);
          setCurrentChamberIndex(0); // Reset to first chamber on fetch
        } else {
          setChamberData(null);
        }
        // also fetch profile so icons can use profile links
        try {
          const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(profileRes.data.data || null);
        } catch (err) {
          // ignore profile fetch error here; profile remains null
          setProfile(null);
        }
      } catch (err: any) {
        // removed unused: setFetchError
        setChamberData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChamber();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow px-2 pb-32 min-h-screen mt-2">
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : editMode ? (
          <form
            onSubmit={handleEditSave}
            className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              {editMode === "update"
                ? i18n.t("update_chamber")
                : i18n.t("enter_chamber_detail")}
            </h2>
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="enName"
              placeholder={i18n.t("placeholder_chamber_english")}
              value={editChamber?.enName || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="cnName"
              placeholder={i18n.t("placeholder_chamber_chinese")}
              value={editChamber?.cnName || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="designation"
              placeholder="Designation in Chamber"
              value={editChamber?.designation || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            {/* Image/Video Preview and Upload */}
            <div className="flex flex-col items-center mb-4 w-full">
              <div
                className="w-full rounded-xl flex items-center justify-center mb-4 cursor-pointer h-48"
                onClick={() =>
                  document.getElementById("chamber-file-input")?.click()
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
                ) : editChamber?.image &&
                  editChamber.image.startsWith("data:image") ? (
                  <img
                    src={editChamber.image}
                    alt="chamber"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : editChamber?.image && editChamber.image.endsWith(".mp4") ? (
                  <video
                    src={editChamber.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : editChamber?.image ? (
                  <img
                    src={editChamber.image}
                    alt="chamber"
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
                id="chamber-file-input"
                type="file"
                accept="image/*,video/*"
                onChange={handleEditFile}
                disabled={editLoading}
                className="hidden"
              />
            </div>
            <textarea
              className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full h-48 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 resize-none"
              name="details"
              placeholder={i18n.t("chamber_details") || "Chamber details"}
              value={editChamber?.details || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <div className="w-full">
              <input
                className={`rounded-full border-2 px-4 py-2 mb-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 ${
                  validationErrors.website
                    ? "border-red-500"
                    : "border-blue-200"
                }`}
                type="text"
                name="website"
                placeholder={
                  i18n.t("website_for_chamber") || "Website for Chamber"
                }
                value={editChamber?.website || ""}
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
                  validationErrors.telegram
                    ? "border-red-500"
                    : "border-blue-200"
                }`}
                type="text"
                name="telegram"
                placeholder={
                  i18n.t("telegram_placeholder") || "https://t.me/Telegram Id"
                }
                value={editChamber?.telegram || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {validationErrors.telegram && (
                <div className="text-red-500 text-xs mb-2 px-2">
                  {validationErrors.telegram}
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
                value={editChamber?.instagram || ""}
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
                value={editChamber?.youtube || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {validationErrors.youtube && (
                <div className="text-red-500 text-xs mb-2 px-2">
                  {validationErrors.youtube}
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
                value={editChamber?.facebook || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {validationErrors.facebook && (
                <div className="text-red-500 text-xs mb-2 px-2">
                  {validationErrors.facebook}
                </div>
              )}
            </div>
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="order"
              placeholder={i18n.t("placeholder_display_order")}
              value={editChamber?.order || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            {editError && (
              <div className="text-red-500 mb-2 text-center">{editError}</div>
            )}
            <div className="flex gap-4 w-full">
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                onClick={() => {
                  setEditMode(null);
                  setEditChamber(null);
                  setEditError("");
                }}
                disabled={editLoading}
              >
                {i18n.t("cancel")}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full py-2 font-bold disabled:opacity-50"
                style={{
                  backgroundColor: "var(--app-background-color)",
                  color: "var(--app-font-color)",
                }}
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
            </div>
            {/* Delete button inside edit mode (only for updates) */}
            {editMode === "update" && (
              <button
                type="button"
                className="w-full bg-red-600 text-white rounded-full py-2 font-bold mt-2"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteLoading || editLoading}
              >
                Delete Chamber
              </button>
            )}
          </form>
        ) : (
          <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-4 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
            {Array.isArray(chamberData) && chamberData.length > 0 ? (
              (() => {
                const chambers = chamberData;
                const c = chambers[currentChamberIndex];
                return (
                  <>
                    {/* Chamber Top Icon Carousel: company, whatsapp, telegram, phone, personal */}
                    <div className="relative w-full mb-4">
                      <div
                        ref={topIconsRef}
                        onScroll={updateTopScroll}
                        className="flex gap-4 px-6 overflow-x-auto no-scrollbar items-center"
                        style={{
                          scrollBehavior: "smooth",
                          scrollSnapType: "x mandatory" as any,
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => navigate("/sub-company")}
                          style={{
                            backgroundColor: "var(--app-background-color)",
                            scrollSnapAlign: "center" as any,
                          }}
                        >
                          <img
                            src={CompanyLogo}
                            alt="Company"
                            className="w-9 h-9 object-contain"
                          />
                        </div>
                        {whatsappLink && (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            onClick={() =>
                              WebApp.openLink(formatUrl(whatsappLink))
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
                        )}
                        {telegramLink && (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            onClick={() =>
                              WebApp.openLink("https://t.me/" + telegramLink)
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
                        )}
                        {contactNumber && (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                            onClick={() => callOrCopyPhone(String(contactNumber))}
                            style={{
                              backgroundColor: "var(--app-background-color)",
                              scrollSnapAlign: "center" as any,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              size="2x"
                              color="white"
                            />
                          </div>
                        )}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => navigate("/profile")}
                          style={{
                            backgroundColor: "var(--app-background-color)",
                            scrollSnapAlign: "center" as any,
                          }}
                        >
                          <img
                            src={ProfileIcon}
                            alt="Profile"
                            className="w-9 h-9 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Chamber names and designation with navigation arrows */}
                    <div className="relative w-full mb-2">
                      <div
                        className="w-full rounded-full bg-app text-app text-xl font-bold py-2 flex items-center justify-center"
                        style={{ borderRadius: "2rem" }}
                      >
                        {c.chamber_name_english}
                      </div>
                      <button
                        aria-label="Prev chamber"
                        className="absolute left-0 -translate-x-1/2 p-1 rounded-full"
                        style={{
                          top: "calc(50% + 2px)",
                          display: currentChamberIndex > 0 ? "block" : "none",
                        }}
                        onClick={() =>
                          setCurrentChamberIndex((i) => Math.max(i - 1, 0))
                        }
                      >
                        <FontAwesomeIcon icon={faChevronLeft} color="red" />
                      </button>
                      <button
                        aria-label="Next chamber"
                        className="absolute right-0 translate-x-1/2 p-1 rounded-full"
                        style={{
                          top: "calc(50% + 2px)",
                          display:
                            currentChamberIndex < chambers.length - 1
                              ? "block"
                              : "none",
                        }}
                        onClick={() =>
                          setCurrentChamberIndex((i) =>
                            Math.min(i + 1, chambers.length - 1)
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          color="red"
                          className="pt-2"
                        />
                      </button>
                    </div>
                    <div
                      className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
                      style={{ borderRadius: "2rem" }}
                    >
                      {c.chamber_name_chinese}
                    </div>
                    <div
                      className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-4 flex items-center justify-center"
                      style={{ borderRadius: "2rem" }}
                    >
                      {c.chamberdesignation}
                    </div>
                    {/* Image or video */}
                    <div className="flex flex-col items-center mb-6 w-full">
                      <div className="w-full flex justify-center mb-4">
                        {c.video && c.video.endsWith(".mp4") ? (
                          <video
                            src={c.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        ) : c.image ? (
                          <img
                            src={c.image}
                            alt="chamber"
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        ) : (
                          <img
                            src={logo}
                            alt="No chamber"
                            className="w-full h-48 object-cover rounded-xl bg-white"
                          />
                        )}
                      </div>
                      <div
                        className="w-full h-48 bg-white rounded-md p-2 overflow-auto mb-4"
                        style={{
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderColor: "var(--app-background-color)",
                        }}
                      >
                        {c.detail}
                      </div>
                    </div>
                    {/* (Details moved above with media block to match SubCompany layout) */}
                    {/* Bottom Icons: fixed octagonal row (Telegram, Facebook, Instagram, YouTube, Website) */}
                    <div className="w-full mb-6 flex items-center justify-between gap-3">
                      {[
                        {
                          key: "telegram",
                          enabled: !!c.tgchannel,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faTelegram}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            if (c.telegramId)
                              WebApp.openLink(formatUrl(c.tgchannel));
                            else if (c.tgchannel) {
                              // if no full link, try to open as t.me/username
                              // remove leading @ if present
                              const id = (c.tgchannel || "").replace(/^@/, "");
                              WebApp.openLink(`https://t.me/${id}`);
                            }
                          },
                        },
                        ...(c.Facebook
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
                                onClick: () =>
                                  WebApp.openLink(formatUrl(c.Facebook)),
                              },
                            ]
                          : []),
                        ...(c.Instagram
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
                                onClick: () =>
                                  WebApp.openLink(formatUrl(c.Instagram)),
                              },
                            ]
                          : []),
                        ...(c.Youtube
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
                                onClick: () =>
                                  WebApp.openLink(formatUrl(c.Youtube)),
                              },
                            ]
                          : []),
                        {
                          key: "website",
                          enabled: !!c.chamberwebsite,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faGlobe}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            if (c.chamberwebsite)
                              WebApp.openLink(formatUrl(c.chamberwebsite));
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
                    {/* two buttons update add more */}
                    <div className="flex justify-center w-full gap-4 text-center mt-6">
                      <button
                        className="p-2 w-full text-white bg-[#d50078] shadow-md rounded"
                        onClick={() => openEditChamber(c)}
                        type="button"
                      >
                        {i18n.t("update")}
                      </button>
                      <button
                        className="p-2 w-full text-white bg-[#009944] shadow-md rounded"
                        onClick={() => navigate("/create-chamber")}
                        type="button"
                      >
                        {i18n.t("add_more")}
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p className="mb-4">{i18n.t("no_chamber_data")}</p>
                <button
                  className="p-2 px-6 text-white bg-[#009944] shadow-md rounded-full"
                  onClick={() => navigate("/create-chamber")}
                  type="button"
                >
                  {i18n.t("add_chamber")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center">
              Delete Chamber?
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete this chamber? This action cannot
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
                onClick={deleteChamber}
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
