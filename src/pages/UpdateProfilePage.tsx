import Layout from "../components/Layout";
import { useState, useRef } from "react";
// import pencilImage from '../assets/pencil.png';
import profileIcon from "../assets/profileIcon.png";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function UpdateProfilePage() {
  const [isPremiumMember] = useState(false);
  const [ownerNameEnglish, setOwnerNameEnglish] = useState("Hariom Jha");
  const [ownerNameChinese, setOwnerNameChinese] = useState("哈里奥姆·賈");
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
  const [snapchat, setSnapchat] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace with your actual user id and API base url
  const userId = WebApp.initDataUnsafe.user?.id || "";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleProfileUpdate = async () => {
    setLoading(true);
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
      formData.append("WhatsApp", whatsapp);
      formData.append("WeChat", wechat);
      formData.append("Line", line);
      formData.append("Instagram", instagram);
      formData.append("Facebook", facebook);
      formData.append("Twitter", twitter);
      formData.append("Youtube", youtube);
      formData.append("Linkedin", linkedin);
      formData.append("SnapChat", snapchat);
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
        }
      );
      if (res.status === 200) {
        WebApp.showAlert("Profile updated successfully!");
      }
    } catch (err: any) {
      WebApp.showAlert(
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle profile icon click
  const handleProfileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (isPremiumMember) {
      if (file.type.startsWith("image/")) {
        setProfileImage(file);
        setVideo(null);
        setMediaPreview(URL.createObjectURL(file));
      } else if (file.type.startsWith("video/")) {
        setVideo(file);
        setProfileImage(null);
        setMediaPreview(URL.createObjectURL(file));
      } else {
        WebApp.showAlert("Please select an image or video file.");
      }
    } else {
      if (file.type.startsWith("image/")) {
        setProfileImage(file);
        setVideo(null);
        setMediaPreview(URL.createObjectURL(file));
      } else {
        WebApp.showAlert("Only image upload is allowed for basic users.");
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col  justify-center flex-grow py-4 px-2 pb-32">
        {!isPremiumMember && (
          <div className="bg-black text-white text-center border-2 border-gray-400">
            <h2 className="text-lg font-bold mb-2">
              Upgrade to Premium Membership to avail exciting features{" "}
              <span className="text-[#00AEEF]">Upgrade now</span>
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
                defaultValue="Hariom Jha"
                onChange={(e) => setOwnerNameEnglish(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF] flex-1">
              <input
                type="text"
                className="w-full bg-transparent text-black outline-none"
                defaultValue="哈里奥姆·賈"
                onChange={(e) => setOwnerNameChinese(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto mt-2">
          <div className="flex flex-col items-center">
            {/* Large circular profile picture placeholder */}
            <div
              className="rounded-full flex items-center justify-center mb-6 cursor-pointer"
              onClick={handleProfileIconClick}
            >
              {mediaPreview ? (
                profileImage ? (
                  <img
                    src={mediaPreview}
                    alt="Profile Preview"
                    className="w-[180px] h-[180px] object-cover rounded-full"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-[180px] h-[180px] rounded-full object-cover"
                  />
                )
              ) : (
                <img
                  src={profileIcon}
                  alt="Profile Icon"
                  className="w-[180px] h-[180px]"
                />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={isPremiumMember ? "image/*,video/*" : "image/*"}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {/* Browse and Cancel buttons can be removed or kept as needed */}
            {/* <div className="flex gap-4 mb-4">
                            <button
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                onClick={() => WebApp.showAlert("Browse functionality to be implemented")}
                            >
                                Browse
                            </button>
                            <button
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                onClick={() => WebApp.showAlert("Cancel functionality to be implemented")}
                            >
                                Cancel
                            </button>
                        </div> */}

            {/* Upload instruction text */}
            <p className="text-black text-center text-sm">
              Please upload 180 X 180 Image or upgrade to <br />
              premium for upload{" "}
              <span className="text-[#00AEEF] font-medium">Video</span>
            </p>
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
          <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="Phone Number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
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
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="email"
              className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-blue-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Wechat"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Line"
              value={line}
              onChange={(e) => setLine(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="SnapChat"
              value={snapchat}
              onChange={(e) => setSnapchat(e.target.value)}
            />
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
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="Youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
            <input
              type="text"
              className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
              placeholder="X"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>
        </section>

        <div
          className="text-white mt-6 p-1 w-full bg-[#d50078] text-center"
          onClick={handleProfileUpdate}
          style={{
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {loading ? "Updating..." : "Update your Profile"}
        </div>
      </div>
    </Layout>
  );
}
