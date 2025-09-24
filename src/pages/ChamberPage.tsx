import Layout from "../components/Layout";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import CompanyLogo from "../assets/company.svg";
import ProfileIcon from "../assets/profileIcon.png";
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
    order: "",
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
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [chamberData, setChamberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const fetchChamber = async () => {
      setLoading(true);
      setFetchError("");
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
        } else {
          setChamberData(null);
        }
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to fetch chamber data"
        );
        setChamberData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchChamber();
  }, []);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileError("");
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setFileError("");
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
      formData.append("tgchannel", form.telegram);
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
      // Optionally show success or redirect
    } catch (err: any) {
      setFileError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create chamber"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow px-2 pb-32 min-h-screen mt-2">
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : Array.isArray(chamberData) && chamberData.length > 0 ? (
          <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-4 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
            {(() => {
              const c = chamberData[0];
              return (
                <>
                  <div className="flex flex-row gap-8 mb-4">
                    <img src={CompanyLogo} alt="Profile" className="w-8 h-8" />
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
                      className="bg-white rounded-xl p-2 flex items-center justify-center w-full"
                      style={{ width: 350, height: 200 }}
                    >
                      {c.image ? (
                        <img
                          src={c.image}
                          alt="chamber"
                          className="object-contain mx-auto"
                          style={{ maxWidth: "100%", maxHeight: "100%" }}
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
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
                    <div className="p-2 w-full text-white bg-[#d50078] shadow-md">
                      Update
                    </div>
                    <div className="p-2 w-full text-white bg-[#009944] shadow-md">
                      Add More
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Enter your chamber detail
            </h2>
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="enName"
              placeholder="English Name for Chamber"
              value={form.enName}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="cnName"
              placeholder="Chinese Name for Chamber"
              value={form.cnName}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="designation"
              placeholder="Designation in Chamber"
              value={form.designation}
              onChange={handleInput}
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
              {file && (
                <div className="text-white text-xs mb-2">{file.name}</div>
              )}
              {fileError && (
                <div className="text-red-500 text-xs mb-2">{fileError}</div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex gap-4 mb-3 w-full justify-center">
              <button
                type="button"
                className="bg-black text-white px-6 py-2 rounded-md font-bold"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Browse
              </button>
              <button
                type="button"
                className="bg-black text-white px-6 py-2 rounded-md font-bold"
                onClick={handleCancelFile}
                disabled={uploading || !file}
              >
                Cancel
              </button>
            </div>
            <textarea
              className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 min-h-[80px]"
              name="details"
              placeholder="Chamber details"
              value={form.details}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="website"
              placeholder="Website for Chamber"
              value={form.website}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="telegram"
              placeholder="https://t.me/Telegram Id"
              value={form.telegram}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="instagram"
              placeholder="https://Instagram"
              value={form.instagram}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="youtube"
              placeholder="https://Youtube"
              value={form.youtube}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="facebook"
              placeholder="https://Facebook"
              value={form.facebook}
              onChange={handleInput}
            />
            <input
              className="rounded-full border-2 border-blue-200 px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
              type="text"
              name="order"
              placeholder="Set display order"
              value={form.order}
              onChange={handleInput}
            />
            <button
              type="submit"
              className="w-full bg-pink-500 text-white font-bold py-2 rounded-full text-lg mt-2 shadow-md hover:bg-pink-600 transition"
              disabled={uploading}
            >
              Save
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
