import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CompanyLogo from "../assets/company.svg";
import LeftArrow from "../assets/left-arrow.png";
import RightArrow from "../assets/right-arrow.png";
import ProfileIcon from "../assets/profileIcon.png";
import logo from "../assets/logo.png";
import {
  faWhatsapp,
  faTelegram,
  faYoutube,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ChamberPage() {
  const navigate = useNavigate();
  const [currentChamberIndex, setCurrentChamberIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [chamberData, setChamberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<null | "create" | "update">(null);
  const [editChamber, setEditChamber] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
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
    setEditChamber({ ...editChamber, [e.target.name]: e.target.value });
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
          setChamberData(res.data.data);
          setCurrentChamberIndex(0); // Reset to first chamber on fetch
        } else {
          setChamberData(null);
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
                ? "Update Chamber"
                : "Enter your chamber detail"}
            </h2>
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="enName"
              placeholder="English Name for Chamber"
              value={editChamber?.enName || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="cnName"
              placeholder="Chinese Name for Chamber"
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
              <div className="text-white text-center text-base font-semibold">
                Please upload
                <br />
                640 width by 360 high Image
                <br />
                or
              </div>
              <div className="text-yellow-300 text-center text-base font-semibold mb-2">
                Premium Member Upload 1 Minute Video
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
                  Browse
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
                disabled={editLoading}
              >
                Cancel
              </button>
            </div>
            <textarea
              className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 min-h-[80px]"
              name="details"
              placeholder="Chamber details"
              value={editChamber?.details || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="website"
              placeholder="Website for Chamber"
              value={editChamber?.website || ""}
              onChange={handleEditInput}
              disabled={editLoading}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="telegram"
              placeholder="https://t.me/Telegram Id"
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
              placeholder="Set display order"
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
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50"
                disabled={editLoading}
              >
                {editLoading
                  ? editMode === "update"
                    ? "Updating..."
                    : "Saving..."
                  : editMode === "update"
                  ? "Update"
                  : "Save"}
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
                    {/* Arrow navigation if more than 1 chamber */}
                    {Array.isArray(chambers) && chambers.length > 1 && (
                      <div className="flex flex-row justify-between items-center w-full mb-2">
                        <button
                          className={`p-1 ${
                            currentChamberIndex === 0
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            setCurrentChamberIndex((i) => Math.max(0, i - 1))
                          }
                          disabled={currentChamberIndex === 0}
                          aria-label="Previous Chamber"
                        >
                          <img
                            src={LeftArrow}
                            alt="Left Arrow"
                            className="w-7 h-7"
                          />
                        </button>
                        <span className="text-sm text-gray-500">
                          {currentChamberIndex + 1} / {chambers.length}
                        </span>
                        <button
                          className={`p-1 ${
                            currentChamberIndex === chambers.length - 1
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            setCurrentChamberIndex((i) =>
                              Math.min(chambers.length - 1, i + 1)
                            )
                          }
                          disabled={currentChamberIndex === chambers.length - 1}
                          aria-label="Next Chamber"
                        >
                          <img
                            src={RightArrow}
                            alt="Right Arrow"
                            className="w-7 h-7"
                          />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-row gap-8 mb-4">
                      <img
                        src={CompanyLogo}
                        alt="Profile"
                        className="w-8 h-8"
                      />
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="w-8 h-8 text-green-500"
                        title="WhatsApp"
                      />
                      <FontAwesomeIcon
                        icon={faYoutube}
                        className="w-8 h-8 text-red-500"
                        title="YouTube"
                      />
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="w-8 h-8 text-pink-500"
                        title="Phone"
                      />
                      <img
                        src={ProfileIcon}
                        alt="profile"
                        className="w-8 h-8 text-blue-500"
                        title="profile"
                      />
                    </div>
                    {/* Chamber names and designation */}
                    <div className="flex flex-col w-full mb-3 gap-4">
                      <div className="w-full">
                        <div className="rounded-full w-full text-center font-bold bg-white border-2 border-blue-200 mb-1 py-2 text-lg">
                          {c.chamber_name_english}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="rounded-full w-full text-center font-bold bg-white border-2 border-blue-200 mb-1 py-2 text-lg">
                          {c.chamber_name_chinese}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="rounded-full w-full text-center font-bold bg-white border-2 border-blue-200 mb-1 py-2 text-lg">
                          {c.chamberdesignation}
                        </div>
                      </div>
                    </div>
                    {/* Image or video */}
                    <div className="w-full flex justify-center mb-3">
                      <div
                        className="rounded-xl p-2 flex items-center justify-center w-full"
                        style={{ width: 350, height: 200 }}
                      >
                        {c.image ? (
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
                    {/* Details box */}
                    <div className="w-full flex mb-3">
                      <div
                        className="bg-white rounded-xl p-3 flex  w-full text-base text-gray-800 text-left"
                        style={{ width: 350, height: 200 }}
                      >
                        <span>{c.detail}</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-8 mb-4 justify-center w-full">
                      {/* <img src={CompanyLogo} alt="Profile" className="w-8 h-8" /> */}
                      <FontAwesomeIcon
                        icon={faTelegram}
                        className="w-8 h-8 text-blue-400"
                        title="Telegram"
                      />
                      <FontAwesomeIcon
                        icon={faYoutube}
                        className="w-8 h-8 text-red-500"
                        title="YouTube"
                      />
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="w-8 h-8 text-blue-600"
                        title="Facebook"
                      />
                      <FontAwesomeIcon
                        icon={faInstagram}
                        className="w-8 h-8 text-pink-500"
                        title="Instagram"
                      />
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="w-8 h-8 text-green-600"
                        title="Website"
                      />
                    </div>
                    {/* two buttons update add more */}
                    <div className="flex justify-center w-full gap-4 text-center mt-6">
                      <button
                        className="p-2 w-full text-white bg-[#d50078] shadow-md rounded"
                        onClick={() => openEditChamber(c)}
                        type="button"
                      >
                        Update
                      </button>
                      <button
                        className="p-2 w-full text-white bg-[#009944] shadow-md rounded"
                        onClick={() => navigate("/create-chamber")}
                        type="button"
                      >
                        Add More
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p className="mb-4">No chamber data found.</p>
                <button
                  className="p-2 px-6 text-white bg-[#009944] shadow-md rounded-full"
                  onClick={() => navigate("/create-chamber")}
                  type="button"
                >
                  Add Chamber
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
