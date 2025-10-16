import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import addmycoLogo from "../assets/addmyco.png";
import chamberIcon from "../assets/chamber.svg";
import companyIcon from "../assets/company.svg";
import { ArrowLeft, ArrowRight, Share2, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleShare = () => {
    const qrLink = `https://addmy.co/${profile?._id || ""}`;
    if (navigator.share) {
      navigator
        .share({
          title: "My Profile",
          text: "Check out my profile!",
          url: qrLink,
        })
        .catch((err) => console.log("Share failed:", err));
    } else {
      navigator.clipboard.writeText(qrLink);
      alert("Link copied to clipboard!");
    }
  };

  const handleScan = () => {
    // Navigate to scanner page or open camera
    window.location.href = "/addmyco/search";
  };

  if (loading) {
    return (
      <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const companyData = profile?.companydata;
  const qrLink = `https://addmy.co/${profile?._id || ""}`;

  return (
    <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Company Name in English */}
          <button
            className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyData?.company_name_english || "Company Name"}
          </button>
          {/* Company Name in Chinese */}
          <button
            className="w-full rounded-full bg-app text-app text-xl font-bold mb-2 py-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyData?.company_name_chinese || "公司名称"}
          </button>

          {/* Company Image/Video */}
          <div className="flex flex-col items-center mb-6">
            <div className="rounded-full mb-2 w-[180px] h-[180px] flex items-center justify-center overflow-hidden bg-white">
              {profile?.profile_image &&
              profile.profile_image.trim() !== "" &&
              !profile.profile_image.endsWith("undefined") ? (
                profile.profile_image.endsWith(".mp4") ? (
                  <video
                    src={profile.profile_image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <img
                    src={profile.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                )
              ) : (
                <img
                  src={addmycoLogo}
                  alt="Default Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>

            {/* User Name in English */}
            <div
              className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {profile?.owner_name_english || "User Name"}
            </div>
            {/* User Name in Chinese */}
            <div
              className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-4 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {profile?.owner_name_chinese || "用户名"}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <ArrowLeft
              className="w-8 h-8 text-app cursor-pointer"
              aria-label="Left"
            />
            <img
              onClick={() => {
                navigate("/sub-company");
              }}
              src={companyIcon}
              alt="Company"
              className="w-12 h-12 rounded-full bg-app p-2 cursor-pointer"
            />
            {/* whatsappIcon */}
            <div className="text-app">
              <FontAwesomeIcon icon={faWhatsapp} size="2x" />
            </div>
            {/* telegramIcon */}
            <div className="text-app">
              <FontAwesomeIcon icon={faTelegram} size="2x" />
            </div>
            {/* phoneIcon */}
            <div className="text-app">
              <FontAwesomeIcon icon={faPhone} size="2x" />
            </div>
            <img
              onClick={() => {
                navigate("/chamber");
              }}
              src={chamberIcon}
              alt="Chamber"
              className="w-12 h-12 rounded-full bg-app p-2 cursor-pointer"
            />
            <ArrowRight
              className="w-8 h-8 text-app cursor-pointer"
              aria-label="Right"
            />
          </div>

          {/* Address before QR Code (address1, address2, address3) */}
          {(profile?.address1 || profile?.address2 || profile?.address3) && (
            <div
              className="w-full rounded-md bg-white p-4 mb-4 shadow text-center"
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: "var(--app-background-color)",
              }}
            >
              {profile.address1 && (
                <div className="text-app">{profile.address1}</div>
              )}
              {profile.address2 && (
                <div className="text-app">{profile.address2}</div>
              )}
              {profile.address3 && (
                <div className="text-app">{profile.address3}</div>
              )}
            </div>
          )}
          {/* Dynamic QR Code */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-white">
              <QRCodeSVG
                value={qrLink}
                size={160}
                bgColor="#ffffff"
                fgColor={(() => {
                  try {
                    return (
                      getComputedStyle(document.documentElement)
                        .getPropertyValue("--app-background-color")
                        .trim() || "#007cb6"
                    );
                  } catch (e) {
                    return "#007cb6";
                  }
                })()}
                level="Q"
                imageSettings={{
                  src: logo,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* Share and Scan Buttons (icon only, circular) */}
          <div className="flex gap-6 w-full justify-center mt-2">
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-app rounded-full flex items-center justify-center hover:opacity-90 transition"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6 text-app" />
            </button>
            <button
              onClick={handleScan}
              className="w-12 h-12 bg-app rounded-full flex items-center justify-center hover:opacity-90 transition"
              aria-label="Scan"
            >
              <Camera className="w-6 h-6 text-app" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
