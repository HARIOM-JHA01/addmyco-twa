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
import { faGlobe, faPhone } from "@fortawesome/free-solid-svg-icons";
import leftArrow from "../assets/left-arrow.png";
import rightArrow from "../assets/right-arrow.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WebApp from "@twa-dev/sdk";
import i18n from "../i18n";
import { formatUrl } from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ChamberPage() {
  const navigate = useNavigate();
  const [currentChamberIndex, setCurrentChamberIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [chamberData, setChamberData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<null | "create" | "update">(null);
  const [editChamber, setEditChamber] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  // Icon carousel refs & state for chamber page
  const topIconsRef = useRef<HTMLDivElement | null>(null);
  const bottomIconsRef = useRef<HTMLDivElement | null>(null);
  const [showTopArrows, setShowTopArrows] = useState(false);
  const [canTopLeft, setCanTopLeft] = useState(false);
  const [canTopRight, setCanTopRight] = useState(false);
  const [, setShowBottomArrows] = useState(false);
  const [_, setCanBottomLeft] = useState(false);
  const [__, setCanBottomRight] = useState(false);

  const updateTopScroll = () => {
    const el = topIconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowTopArrows(overflow);
    setCanTopLeft(el.scrollLeft > 8);
    setCanTopRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const updateBottomScroll = () => {
    const el = bottomIconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowBottomArrows(overflow);
    setCanBottomLeft(el.scrollLeft > 8);
    setCanBottomRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
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
      user_id: chamber.user_id,
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
  // Handle edit form input
  const handleEditInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
    setEditChamber({ ...editChamber, [name]: value });
  };
  // Handle edit form file
  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setEditChamber((prev: any) => ({ ...prev, image: base64 }));
    }
  };
  // Save handler for both create and update
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      if (editMode === "update") {
        // Update
        const payload = {
          user_id: editChamber.user_id,
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
              Instagram: editChamber.instagram,
              image: editChamber.image,
            },
          ],
        };
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
      // Refresh chamber data
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
            {/* Upload area */}
            <div className="w-full bg-blue-400 rounded-xl flex flex-col items-center justify-center py-8 mb-3">
              <div className="text-white text-center text-base font-semibold whitespace-pre-line">
                {i18n.t("please_upload")}
              </div>
              {editChamber?.image &&
                editChamber.image.startsWith("data:image") && (
                  <img
                    src={editChamber.image}
                    alt="chamber"
                    className="max-h-20 mt-2"
                  />
                )}
            </div>
            {/* File input and Cancel button below the upload box */}
            <div className="w-full flex flex-row items-center justify-center gap-4 mb-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleEditFile}
                  disabled={editLoading}
                  className="hidden"
                />
                <span className="bg-black text-white rounded px-6 py-2 font-semibold cursor-pointer select-none text-sm text-center">
                  {i18n.t("browse")}
                </span>
              </label>
              <button
                type="button"
                className="bg-black text-white rounded px-6 py-2 font-semibold text-sm text-center"
                onClick={() => {
                  setEditMode(null);
                  setEditChamber(null);
                  setEditError("");
                }}
                disabled={
                  editLoading ||
                  (editChamber?.order !== undefined && !!editError)
                }
              >
                {i18n.t("cancel")}
              </button>
            </div>
            <textarea
              className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 min-h-[80px]"
              name="details"
              placeholder={i18n.t("chamber_details") || "Chamber details"}
              value={editChamber?.details || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="website"
              placeholder={
                i18n.t("website_for_chamber") || "Website for Chamber"
              }
              value={editChamber?.website || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="telegram"
              placeholder={
                i18n.t("telegram_placeholder") || "https://t.me/Telegram Id"
              }
              value={editChamber?.telegram || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="instagram"
              placeholder="https://Instagram"
              value={editChamber?.instagram || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="youtube"
              placeholder="https://Youtube"
              value={editChamber?.youtube || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="facebook"
              placeholder="https://Facebook"
              value={editChamber?.facebook || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
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
                      <button
                        aria-label="Top scroll left"
                        className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 rounded-full ${
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
                        {/* <FontAwesomeIcon icon={faArrowLeft} color="white" /> */}
                      </button>
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
                              WebApp.openLink(formatUrl(telegramLink))
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
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            onClick={() =>
                              WebApp.openLink(`tel:${contactNumber}`)
                            }
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
                      <button
                        aria-label="Top scroll right"
                        className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 rounded-full ${
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
                        {/* <FontAwesomeIcon icon={faArrowRight} color="white" /> */}
                      </button>
                    </div>
                    {/* Chamber names and designation (company-style) */}
                    {/* Chamber Names with navigation arrows (overlay, name stays full-width) */}
                    <div className="relative w-full mb-2">
                      <div
                        className="w-full rounded-full bg-app text-app text-xl font-bold py-2 flex items-center justify-center"
                        style={{ borderRadius: "2rem" }}
                      >
                        {c.chamber_name_english}
                      </div>
                      <button
                        aria-label="Prev chamber"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1 rounded-full ${
                          currentChamberIndex > 0
                            ? "opacity-100"
                            : "opacity-30 pointer-events-none"
                        }`}
                        onClick={() =>
                          setCurrentChamberIndex((i) => Math.max(i - 1, 0))
                        }
                        disabled={currentChamberIndex === 0}
                      >
                        <img src={leftArrow} alt="prev" className="w-6 h-6" />
                      </button>
                      <button
                        aria-label="Next chamber"
                        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-1 rounded-full ${
                          currentChamberIndex < chambers.length - 1
                            ? "opacity-100"
                            : "opacity-30 pointer-events-none"
                        }`}
                        onClick={() =>
                          setCurrentChamberIndex((i) =>
                            Math.min(i + 1, chambers.length - 1)
                          )
                        }
                        disabled={currentChamberIndex >= chambers.length - 1}
                      >
                        <img src={rightArrow} alt="next" className="w-6 h-6" />
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
                    {/* Image or video - rectangular preview like SubCompany */}
                    <div className="flex flex-col items-center mb-6 w-full">
                      <div className="w-full flex justify-center mb-4">
                        <div
                          className="rounded-xl p-2 flex items-center justify-center w-full"
                          style={{ height: 200 }}
                        >
                          {c.video && c.video.endsWith(".mp4") ? (
                            <video
                              src={c.video}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="object-contain mx-auto rounded-md w-full h-full"
                              style={{ maxWidth: "100%", maxHeight: "100%" }}
                            />
                          ) : c.image ? (
                            <img
                              src={c.image}
                              alt="chamber"
                              className="object-contain mx-auto rounded-md"
                              style={{ maxWidth: "100%", maxHeight: "100%" }}
                            />
                          ) : (
                            <img
                              src={logo}
                              alt="No chamber"
                              className="object-contain mx-auto rounded-md bg-white w-full"
                              style={{ maxWidth: "100%", maxHeight: "100%" }}
                            />
                          )}
                        </div>
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
                          enabled: !!c.telegramId,
                          render: () => (
                            <FontAwesomeIcon
                              icon={faTelegram}
                              size="lg"
                              color="white"
                            />
                          ),
                          onClick: () => {
                            if (c.telegramId)
                              WebApp.openLink(formatUrl(c.telegramId));
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
    </Layout>
  );
}
