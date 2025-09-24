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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const openUpdateModal = (chamber: any) => {
    setUpdateForm({ ...chamber, image: chamber.image });
    setShowUpdateModal(true);
    setUpdateError("");
  };
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateForm(null);
    setUpdateError("");
  };
  const handleUpdateInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };
  const handleUpdateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setUpdateForm((prev: any) => ({ ...prev, image: base64 }));
    }
  };
  const handleUpdateChamber = async () => {
    setUpdateLoading(true);
    setUpdateError("");
    try {
      const token = localStorage.getItem("token");
      const userId = updateForm.user_id;
      if (!token || !userId) throw new Error("No token or user id");
      const payload = {
        user_id: userId,
        data: [
          {
            _id: updateForm._id,
            chamber_name_english: updateForm.chamber_name_english,
            chamber_name_chinese: updateForm.chamber_name_chinese,
            chamberdesignation: updateForm.chamberdesignation,
            chamberwebsite: updateForm.chamberwebsite,
            detail: updateForm.detail,
            WhatsApp: updateForm.WhatsApp,
            WeChat: updateForm.WeChat,
            Instagram: updateForm.Instagram,
            image: updateForm.image,
          },
        ],
      };
      await axios.post(`${API_BASE_URL}/updatechamber`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setShowUpdateModal(false);
      setUpdateForm(null);
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
      }
    } catch (err: any) {
      setUpdateError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update chamber"
      );
    } finally {
      setUpdateLoading(false);
    }
  };
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
                    <button
                      className="p-2 w-full text-white bg-[#d50078] shadow-md rounded"
                      onClick={() => openUpdateModal(c)}
                      type="button"
                    >
                      Update
                    </button>
                    <div className="p-2 w-full text-white bg-[#009944] shadow-md rounded">
                      Add More
                    </div>
                  </div>
                  {/* Update Chamber Modal */}
                  {showUpdateModal && updateForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col items-center shadow-lg relative">
                        <button
                          className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                          onClick={closeUpdateModal}
                        >
                          &times;
                        </button>
                        <h3 className="text-lg font-bold mb-4">
                          Update Chamber
                        </h3>
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="chamber_name_english"
                          placeholder="English Name for Chamber"
                          value={updateForm.chamber_name_english}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="chamber_name_chinese"
                          placeholder="Chinese Name for Chamber"
                          value={updateForm.chamber_name_chinese}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="chamberdesignation"
                          placeholder="Designation"
                          value={updateForm.chamberdesignation}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="chamberwebsite"
                          placeholder="Website"
                          value={updateForm.chamberwebsite}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <textarea
                          className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 min-h-[60px]"
                          name="detail"
                          placeholder="Chamber details"
                          value={updateForm.detail}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="WhatsApp"
                          placeholder="WhatsApp"
                          value={updateForm.WhatsApp || ""}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="WeChat"
                          placeholder="WeChat"
                          value={updateForm.WeChat || ""}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        <input
                          className="rounded-full border-2 border-blue-200 px-4 py-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                          type="text"
                          name="Instagram"
                          placeholder="Instagram"
                          value={updateForm.Instagram || ""}
                          onChange={handleUpdateInput}
                          disabled={updateLoading}
                        />
                        {/* Image upload */}
                        <div className="w-full flex flex-col items-center mb-2">
                          <label className="mb-1 font-semibold">Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpdateFile}
                            disabled={updateLoading}
                          />
                          {updateForm.image &&
                            updateForm.image.startsWith("data:image") && (
                              <img
                                src={updateForm.image}
                                alt="chamber"
                                className="max-h-20 mt-2"
                              />
                            )}
                        </div>
                        {updateError && (
                          <div className="text-red-500 mb-2 text-center">
                            {updateError}
                          </div>
                        )}
                        <button
                          className="w-full bg-blue-500 text-white font-bold py-2 rounded-full text-lg mt-2 shadow-md hover:bg-blue-600 transition"
                          onClick={handleUpdateChamber}
                          disabled={updateLoading}
                          type="button"
                        >
                          {updateLoading ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  )}
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
