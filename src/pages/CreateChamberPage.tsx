import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatUrl, getUrlError, validateVideo } from "../utils/validation";
import WebApp from "@twa-dev/sdk";
import VideoPlayer from "../components/VideoPlayer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateChamberPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    enName: "",
    cnName: "",
    designation: "",
    details: "",
    website: "",
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
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [filePreview1, setFilePreview1] = useState<string | null>(null);
  const [filePreview2, setFilePreview2] = useState<string | null>(null);
  const [filePreview3, setFilePreview3] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const profile = useProfileStore((state) => state.profile);
  const isPremium = profile?.usertype === 1 || profile?.usertype === 2;
  const [occupiedOrders, setOccupiedOrders] = useState<number[]>([]);
  const [activeFileTab, setActiveFileTab] = useState<number>(1);

  const fetchChambers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/getchamber`, {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleFileChange = async (
    fileNumber: 1 | 2 | 3,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0] || null;
    const fileInputRef =
      fileNumber === 1
        ? fileInputRef1
        : fileNumber === 2
          ? fileInputRef2
          : fileInputRef3;

    if (selectedFile) {
      // If file is a video, only allow mp4 and only for premium users
      if (selectedFile.type.startsWith("video/")) {
        if (!isPremium) {
          WebApp.showAlert(
            "Video uploads are available for premium users only.",
          );
          if (fileNumber === 1) {
            setFile1(null);
            setFilePreview1(null);
          } else if (fileNumber === 2) {
            setFile2(null);
            setFilePreview2(null);
          } else {
            setFile3(null);
            setFilePreview3(null);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        if (selectedFile.type !== "video/mp4") {
          setError("Only MP4 video files are allowed.");
          if (fileNumber === 1) {
            setFile1(null);
            setFilePreview1(null);
          } else if (fileNumber === 2) {
            setFile2(null);
            setFilePreview2(null);
          } else {
            setFile3(null);
            setFilePreview3(null);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // Validate video file size and duration
        const validation = await validateVideo(selectedFile);
        if (!validation.isValid) {
          setError(validation.error || "Invalid video file");
          if (fileNumber === 1) {
            setFile1(selectedFile);
            setFilePreview1(URL.createObjectURL(selectedFile));
          } else if (fileNumber === 2) {
            setFile2(selectedFile);
            setFilePreview2(URL.createObjectURL(selectedFile));
          } else {
            setFile3(selectedFile);
            setFilePreview3(URL.createObjectURL(selectedFile));
          }
          return;
        }
      }
      setError("");
      if (fileNumber === 1) {
        setFile1(selectedFile);
        setFilePreview1(URL.createObjectURL(selectedFile));
      } else if (fileNumber === 2) {
        setFile2(selectedFile);
        setFilePreview2(URL.createObjectURL(selectedFile));
      } else {
        setFile3(selectedFile);
        setFilePreview3(URL.createObjectURL(selectedFile));
      }
    } else {
      if (fileNumber === 1) {
        setFile1(null);
        setFilePreview1(null);
      } else if (fileNumber === 2) {
        setFile2(null);
        setFilePreview2(null);
      } else {
        setFile3(null);
        setFilePreview3(null);
      }
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
        form.website ? formatUrl(form.website) : "",
      );
      formData.append(
        "WhatsApp",
        form.whatsapp ? formatUrl(form.whatsapp) : "",
      );
      formData.append("WeChat", form.wechat ? formatUrl(form.wechat) : "");
      formData.append("Line", form.line ? formatUrl(form.line) : "");
      formData.append(
        "Instagram",
        form.instagram ? formatUrl(form.instagram) : "",
      );
      formData.append(
        "Facebook",
        form.facebook ? formatUrl(form.facebook) : "",
      );
      formData.append("Twitter", form.twitter ? formatUrl(form.twitter) : "");
      formData.append("Youtube", form.youtube ? formatUrl(form.youtube) : "");
      formData.append(
        "Linkedin",
        form.linkedin ? formatUrl(form.linkedin) : "",
      );
      formData.append(
        "SnapChat",
        form.snapchat ? formatUrl(form.snapchat) : "",
      );
      formData.append("Skype", form.skype ? formatUrl(form.skype) : "");
      formData.append("TikTok", form.tiktok ? formatUrl(form.tiktok) : "");
      formData.append(
        "tgchannel",
        form.tgchannel ? formatUrl(form.tgchannel) : "",
      );
      formData.append(
        "chamberfanpage",
        form.chamberfanpage ? formatUrl(form.chamberfanpage) : "",
      );
      formData.append("order", form.order);

      if (file1) {
        formData.append("file1", file1);
      }

      if (file2) {
        formData.append("file2", file2);
      }

      if (file3) {
        formData.append("file3", file3);
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
      setFile1(null);
      setFilePreview1(null);
      setFile2(null);
      setFilePreview2(null);
      setFile3(null);
      setFilePreview3(null);

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
                new CustomEvent("profile-updated", { detail: profileData }),
              );
            } catch (evErr) {
              console.warn("Failed to dispatch profile-updated event", evErr);
            }
          } catch (storeErr) {
            console.warn(
              "Failed to update profile store after chamber creation",
              storeErr,
            );
          }
        }
      } catch (pfErr) {
        console.warn(
          "Failed to re-fetch profile after chamber creation",
          pfErr,
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
          "Failed to create chamber",
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
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500 text-black"
              required
            />
            <input
              name="cnName"
              placeholder="Chinese Name for Chamber"
              value={form.cnName}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500 text-black"
            />
            <input
              name="designation"
              placeholder="Designation in Chamber"
              value={form.designation}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white placeholder-gray-500 text-black"
            />

            {/* File Upload Section */}
            {isPremium ? (
              /* Premium User: Single Video Upload */
              <div className="w-full mb-6">
                <div className="w-full flex justify-center mb-2">
                  {filePreview1 ? (
                    <div
                      className="flex items-center justify-center rounded-xl w-full h-48 overflow-hidden"
                      style={{
                        backgroundColor: "var(--app-background-color)",
                      }}
                    >
                      {file1?.type.startsWith("video/") ? (
                        <VideoPlayer
                          src={filePreview1}
                          loop
                          playsInline
                          className="object-cover w-full h-48 rounded-xl"
                        />
                      ) : (
                        <div className="text-white text-center p-4">
                          Premium members can only upload videos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="text-center text-white font-bold py-6 relative flex flex-col items-center justify-center w-full h-48 rounded-xl"
                      style={{
                        backgroundColor: "var(--app-background-color)",
                      }}
                    >
                      <div className="text-lg">
                        Premium Members Can Upload Video Below 1 Minute Length
                      </div>
                      <div className="text-yellow-300 font-bold mt-2">
                        Size Scale 16:9 at 800x 450 , And Below ( 10 MB )
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/mp4"
                  ref={fileInputRef1}
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(1, e)}
                />
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    onClick={() => fileInputRef1.current?.click()}
                  >
                    Browse Video
                  </button>
                  <button
                    type="button"
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setFile1(null);
                      setFilePreview1(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Non-Premium User: Three Image Uploads */
              <div className="w-full flex flex-col md:flex-row gap-4 mb-6">
                {/* File 1 */}
                <div className="flex-1 flex flex-col items-center">
                  {activeFileTab === 1 && (
                    <div className="w-full">
                      <div className="w-full flex justify-center mb-2">
                        {filePreview1 ? (
                          <div
                            className="flex items-center justify-center rounded-xl w-full h-40 overflow-hidden"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <img
                              src={filePreview1}
                              alt="Preview 1"
                              className="object-cover w-full h-40 rounded-xl"
                            />
                          </div>
                        ) : (
                          <div
                            className="text-center text-white text-sm font-bold py-6 relative flex flex-col items-center justify-center w-full h-40 rounded-xl"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <div>File 1</div>
                          </div>
                        )}
                      </div>
                      {/* Numeric tabs */}
                      <div className="flex justify-center gap-4 my-3">
                        {[1, 2, 3].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveFileTab(tab)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all ${
                              activeFileTab === tab
                                ? "bg-blue-500 text-white scale-110"
                                : "bg-gray-300 text-black hover:bg-gray-400"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        ref={fileInputRef1}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(1, e)}
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => fileInputRef1.current?.click()}
                        >
                          Browse
                        </button>
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => {
                            setFile1(null);
                            setFilePreview1(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* File 2 */}
                <div className="flex-1 flex flex-col items-center">
                  {activeFileTab === 2 && (
                    <div className="w-full">
                      <div className="w-full flex justify-center mb-2">
                        {filePreview2 ? (
                          <div
                            className="flex items-center justify-center rounded-xl w-full h-40 overflow-hidden"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <img
                              src={filePreview2}
                              alt="Preview 2"
                              className="object-cover w-full h-40 rounded-xl"
                            />
                          </div>
                        ) : (
                          <div
                            className="text-center text-white text-sm font-bold py-6 relative flex flex-col items-center justify-center w-full h-40 rounded-xl"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <div>File 2</div>
                          </div>
                        )}
                      </div>
                      {/* Numeric tabs */}
                      <div className="flex justify-center gap-4 my-3">
                        {[1, 2, 3].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveFileTab(tab)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all ${
                              activeFileTab === tab
                                ? "bg-blue-500 text-white scale-110"
                                : "bg-gray-300 text-black hover:bg-gray-400"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        ref={fileInputRef2}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(2, e)}
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => fileInputRef2.current?.click()}
                        >
                          Browse
                        </button>
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => {
                            setFile2(null);
                            setFilePreview2(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* File 3 */}
                <div className="flex-1 flex flex-col items-center">
                  {activeFileTab === 3 && (
                    <div className="w-full">
                      <div className="w-full flex justify-center mb-2">
                        {filePreview3 ? (
                          <div
                            className="flex items-center justify-center rounded-xl w-full h-40 overflow-hidden"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <img
                              src={filePreview3}
                              alt="Preview 3"
                              className="object-cover w-full h-40 rounded-xl"
                            />
                          </div>
                        ) : (
                          <div
                            className="text-center text-white text-sm font-bold py-6 relative flex flex-col items-center justify-center w-full h-40 rounded-xl"
                            style={{
                              backgroundColor: "var(--app-background-color)",
                            }}
                          >
                            <div>File 3</div>
                          </div>
                        )}
                      </div>
                      {/* Numeric tabs */}
                      <div className="flex justify-center gap-4 my-3">
                        {[1, 2, 3].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveFileTab(tab)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all ${
                              activeFileTab === tab
                                ? "bg-blue-500 text-white scale-110"
                                : "bg-gray-300 text-black hover:bg-gray-400"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        ref={fileInputRef3}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(3, e)}
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => fileInputRef3.current?.click()}
                        >
                          Browse
                        </button>
                        <button
                          type="button"
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                          onClick={() => {
                            setFile3(null);
                            setFilePreview3(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {error &&
              (file1?.type.startsWith("video/") ||
                file2?.type.startsWith("video/") ||
                file3?.type.startsWith("video/")) && (
                <div className="text-red-500 text-sm mb-4 text-center">
                  {error}
                </div>
              )}

            <textarea
              name="details"
              placeholder="Chamber details"
              value={form.details}
              onChange={handleChange}
              className="w-full h-48 rounded-xl px-4 py-2 border border-blue-500 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-black"
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
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 text-black`}
              />
              {validationErrors.website && (
                <div className="text-red-500 text-xs px-2 mb-2">
                  {validationErrors.website}
                </div>
              )}
            </div>
            <div className="w-full">
              <input
                name="tgchannel"
                placeholder="https://t.me/TG Channel"
                value={form.tgchannel}
                onChange={handleChange}
                className={`w-full rounded-full px-[12px] py-2 border-2 ${
                  validationErrors.tgchannel
                    ? "border-red-500"
                    : "border-blue-200"
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 text-black`}
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
                } mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 text-black`}
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
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 text-black"
            />
            <input
              name="facebook"
              placeholder="https://Facebook"
              value={form.facebook}
              onChange={handleChange}
              className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 text-black"
            />
            <div className="w-full mb-2">
              <label className="block text-sm mb-1">Display Order</label>
              <select
                name="order"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full rounded-full px-[12px] py-2 border-2 border-blue-200 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
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
