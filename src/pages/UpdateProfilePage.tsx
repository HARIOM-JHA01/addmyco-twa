import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
// import pencilImage from '../assets/pencil.png';
import logo from "../assets/logo.png";
import WebApp from "@twa-dev/sdk";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  formatUrl,
  getEmailError,
  getPhoneError,
  getUrlError,
  validateVideo,
} from "../utils/validation";
import VideoPlayer from "../components/VideoPlayer";

export default function UpdateProfilePage() {
  const navigate = useNavigate();
  const [ownerNameEnglish, setOwnerNameEnglish] = useState("");
  const [ownerNameChinese, setOwnerNameChinese] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [wechat, setWechat] = useState("");
  const [line, setLine] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberType, setMemberType] = useState("");
  const [videoError, setVideoError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace with your actual user id and API base url
  const userId = WebApp.initDataUnsafe.user?.id || "";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${API_BASE_URL}/getprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        if (!data) return;
        setOwnerNameEnglish(data.owner_name_english || "");
        setOwnerNameChinese(data.owner_name_chinese || "");
        setTelegramId(data.telegramId || "");
        setAddress1(data.address1 || "");
        setAddress2(data.address2 || "");
        setAddress3(data.address3 || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setContact(data.contact ? String(data.contact) : "");
        setWhatsapp(data.WhatsApp || "");
        setWechat(data.WeChat || "");
        setLine(data.Line || "");
        setInstagram(data.Instagram || "");
        setFacebook(data.Facebook || "");
        setTwitter(data.Twitter || "");
        setYoutube(data.Youtube || "");
        setLinkedin(data.Linkedin || "");
        setMemberType(data.membertype || "");
        // Prefill profile image/video preview if present
        if (data.profile_image) {
          // Normalize server URL (may be relative) before using as src
          const normalized = formatUrl(data.profile_image);
          if (data.profile_image.endsWith(".mp4")) {
            setMediaPreview(normalized);
            setProfileImage(null);
            setVideo(null);
          } else {
            setMediaPreview(normalized);
            setProfileImage(null);
            setVideo(null);
          }
        } else {
          // Clear preview if no image exists
          setMediaPreview(null);
          setProfileImage(null);
          setVideo(null);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchProfile();

    // Also fetch when component becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleProfileUpdate = async () => {
    setLoading(true);

    // Validate all fields before submission
    const errors: { [key: string]: string } = {};

    // Validate email
    if (email) {
      const emailError = getEmailError(email);
      if (emailError) errors.email = emailError;
    }

    // Validate contact
    if (contact) {
      const phoneError = getPhoneError(contact);
      if (phoneError) errors.contact = phoneError;
    }

    // Validate all URL fields
    const urlFields = {
      whatsapp,
      wechat,
      line,
      instagram,
      facebook,
      twitter,
      youtube,
      linkedin,
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
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("owner_name_english", ownerNameEnglish);
      formData.append("owner_name_chinese", ownerNameChinese);
      formData.append("telegramId", telegramId);
      formData.append("address1", address1);
      formData.append("address2", address2);
      formData.append("address3", address3);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("contact", contact);
      // Format all URLs before submission
      formData.append("WhatsApp", whatsapp ? formatUrl(whatsapp) : "");
      formData.append("WeChat", wechat ? formatUrl(wechat) : "");
      formData.append("Line", line ? formatUrl(line) : "");
      formData.append("Instagram", instagram ? formatUrl(instagram) : "");
      formData.append("Facebook", facebook ? formatUrl(facebook) : "");
      formData.append("Twitter", twitter ? formatUrl(twitter) : "");
      formData.append("Youtube", youtube ? formatUrl(youtube) : "");
      formData.append("Linkedin", linkedin ? formatUrl(linkedin) : "");
      if (profileImage) formData.append("profile_image", profileImage);
      if (video) formData.append("video", video);

      const res = await axios.post(
        `${API_BASE_URL}/updateprofile/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.status === 200) {
        WebApp.showAlert("Profile updated successfully!");

        // Fetch the updated profile data to refresh the preview
        try {
          const updatedRes = await axios.get(`${API_BASE_URL}/getprofile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = updatedRes.data.data;
          if (data && data.profile_image) {
            setMediaPreview(formatUrl(data.profile_image));
            setProfileImage(null);
            setVideo(null);
          }
        } catch (fetchErr) {
          console.error("Failed to fetch updated profile:", fetchErr);
        }

        // Navigate to profile page to see the changes
        setTimeout(() => navigate("/profile"), 1000);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear any staged files / previews and navigate back to profile
    setProfileImage(null);
    setVideo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Optionally clear the preview while navigating away
    setMediaPreview(null);
    navigate("/profile");
  };

  // Handle profile icon click
  const handleProfileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const isPremium = memberType === "premium";

    if (file.type.startsWith("image/")) {
      setProfileImage(file);
      setVideo(null);
      setVideoError("");
      const previewUrl = URL.createObjectURL(file);
      console.debug("Set local image preview:", previewUrl);
      setMediaPreview(previewUrl);
    } else if (file.type.startsWith("video/")) {
      if (!isPremium) {
        WebApp.showAlert("Video upload is only available for premium members.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.type !== "video/mp4") {
        WebApp.showAlert("Only MP4 video files are allowed.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validate video file size and duration
      const validation = await validateVideo(file);
      if (!validation.isValid) {
        setVideoError(validation.error || "Invalid video file");
        setVideo(file);
        setProfileImage(null);
        setMediaPreview(URL.createObjectURL(file));
        return;
      }

      setVideoError("");
      setVideo(file);
      setProfileImage(null);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      WebApp.showAlert("Please select an image or video file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col  justify-center flex-grow py-4 px-2 pb-32">
        {memberType !== "premium" && (
          <div className="bg-black text-white text-center border-2 border-gray-400">
            <h2 className="text-lg font-bold mb-2">
              Upgrade to Premium Membership to avail exciting features{" "}
              <span
                onClick={() => {
                  navigate("/membership");
                }}
                className="text-[#00AEEF]"
              >
                Upgrade now
              </span>
            </h2>
          </div>
        )}
        <section className="w-full max-w-md mx-auto mt-4">
          {/* <div className="mb-4">
                        <label className="text-black font-bold text-sm mb-2 block">Profile URL:</label>
                        <div className="flex items-center gap-2">
                            <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300 flex-1">
                                <span className="text-black">https://addmy.co/<span className="text-blue-500">6500b34d</span></span>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-2">
                                <img src={pencilImage} alt="Edit" className="w-6 h-6 filter" />
                            </div>
                        </div>
                    </div> */}
          <div className="flex gap-2 mb-4">
            <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF] flex-1">
              <input
                type="text"
                className="w-full bg-transparent text-black outline-none"
                value={ownerNameEnglish}
                onChange={(e) => setOwnerNameEnglish(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF] flex-1">
              <input
                type="text"
                className="w-full bg-transparent text-black outline-none"
                value={ownerNameChinese}
                onChange={(e) => setOwnerNameChinese(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto mt-2">
          <div className="flex flex-col items-center mb-2">
            <div
              className="rounded-full flex items-center justify-center mb-6 cursor-pointer"
              onClick={handleProfileIconClick}
            >
              {mediaPreview ? (
                // Decide between image or video preview. If `video` state is set
                // or the URL ends with .mp4, render a <video>; otherwise render an <img>
                video ||
                (typeof mediaPreview === "string" &&
                  mediaPreview.endsWith(".mp4")) ? (
                  <VideoPlayer
                    src={mediaPreview as string}
                    loop
                    playsInline
                    className="w-[180px] h-[180px] object-cover rounded-full"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Profile Preview"
                    className="w-[180px] h-[180px] object-cover rounded-full"
                  />
                )
              ) : (
                <img
                  src={logo}
                  alt="Default Icon"
                  className="w-[180px] h-[180px] object-cover rounded-full"
                />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {memberType === "premium" ? (
              <span className="text-xs text-black text-center">
                You can upload a 180 x 180 image or a video as your profile
                media.
              </span>
            ) : (
              <span className="text-xs text-black text-center">
                Upload Profile Image
                <br />
                Size 180 x 180
              </span>
            )}
            {videoError && (
              <div className="text-red-500 text-xs mt-2 text-center w-full">
                {videoError}
              </div>
            )}
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="w-full max-w-md mx-auto mt-6 space-y-3">
          {/* Username */}
          <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="Telegram Username"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.contact ? "border-red-500" : "border-[#00AEEF]"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                placeholder="Phone Number"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (validationErrors.contact) {
                    setValidationErrors({
                      ...validationErrors,
                      contact: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.contact && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.contact}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.whatsapp ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                placeholder="WhatsApp"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (validationErrors.whatsapp) {
                    setValidationErrors({
                      ...validationErrors,
                      whatsapp: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.whatsapp && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.whatsapp}
              </div>
            )}
          </div>

          {/* Address Fields */}
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="Address Line 1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="Address Line 2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="Address Line 3"
              value={address3}
              onChange={(e) => setAddress3(e.target.value)}
            />
          </div>

          {/* Optional Section Header */}
          <div className="bg-gray-100 px-4 py-1 text-center">
            <span className="text-black font-medium">Below are optional</span>
          </div>

          {/* Email */}
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.email ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="email"
                className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-blue-300"
                placeholder="Email ex: Bluemarketer@Hotmail.com.hk"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: "" });
                  }
                }}
              />
            </div>
            {validationErrors.email && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.email}
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.wechat ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="Wechat"
                value={wechat}
                onChange={(e) => {
                  setWechat(e.target.value);
                  if (validationErrors.wechat) {
                    setValidationErrors({ ...validationErrors, wechat: "" });
                  }
                }}
              />
            </div>
            {validationErrors.wechat && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.wechat}
              </div>
            )}
          </div>

          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.facebook ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="Facebook"
                value={facebook}
                onChange={(e) => {
                  setFacebook(e.target.value);
                  if (validationErrors.facebook) {
                    setValidationErrors({
                      ...validationErrors,
                      facebook: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.facebook && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.facebook}
              </div>
            )}
          </div>

          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.instagram
                  ? "border-red-500"
                  : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="Instagram"
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value);
                  if (validationErrors.instagram) {
                    setValidationErrors({
                      ...validationErrors,
                      instagram: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.instagram && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.instagram}
              </div>
            )}
          </div>

          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.line ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="Line"
                value={line}
                onChange={(e) => {
                  setLine(e.target.value);
                  if (validationErrors.line) {
                    setValidationErrors({ ...validationErrors, line: "" });
                  }
                }}
              />
            </div>
            {validationErrors.line && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.line}
              </div>
            )}
          </div>

          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.linkedin ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="LinkedIn"
                value={linkedin}
                onChange={(e) => {
                  setLinkedin(e.target.value);
                  if (validationErrors.linkedin) {
                    setValidationErrors({
                      ...validationErrors,
                      linkedin: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.linkedin && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.linkedin}
              </div>
            )}
          </div>

          {/* <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Tiktok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />
          </div> */}
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.youtube ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="Youtube"
                value={youtube}
                onChange={(e) => {
                  setYoutube(e.target.value);
                  if (validationErrors.youtube) {
                    setValidationErrors({
                      ...validationErrors,
                      youtube: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.youtube && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.youtube}
              </div>
            )}
          </div>
          <div className="w-full">
            <div
              className={`bg-white rounded-full px-4 py-1 border-2 ${
                validationErrors.twitter ? "border-red-500" : "border-blue-300"
              }`}
            >
              <input
                type="text"
                className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                placeholder="X"
                value={twitter}
                onChange={(e) => {
                  setTwitter(e.target.value);
                  if (validationErrors.twitter) {
                    setValidationErrors({
                      ...validationErrors,
                      twitter: "",
                    });
                  }
                }}
              />
            </div>
            {validationErrors.twitter && (
              <div className="text-red-500 text-xs mt-1 px-2">
                {validationErrors.twitter}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 w-full flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-white text-[#333] border-2 border-gray-300 py-2 rounded-full"
            aria-label="Cancel and go back to profile"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProfileUpdate}
            className="flex-1 text-white bg-[#d50078] py-2 rounded-full"
            style={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
            aria-label="Save profile changes"
          >
            {loading ? "Updating..." : "Update your Profile"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
