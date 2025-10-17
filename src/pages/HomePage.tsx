import { useEffect, useState, useRef } from "react";
import logo from "../assets/logo.png";
import addmycoLogo from "../assets/addmyco.png";
import chamberIcon from "../assets/chamber.svg";
import companyIcon from "../assets/company.svg";
import { Share2, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import leftArrow from "../assets/left-arrow.png";
import rightArrow from "../assets/right-arrow.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const iconsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateScroll = () => {
    const el = iconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowArrows(overflow);
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateScroll();
    const onResize = () => updateScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [profile]);

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
        console.error(error);
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
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(qrLink);
      alert("Link copied to clipboard!");
    }
  };

  const handleScan = () => {
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
          <button
            className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyData?.company_name_english || "Company Name"}
          </button>
          <button
            className="w-full rounded-full bg-app text-app text-xl font-bold mb-2 py-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyData?.company_name_chinese || "公司名称"}
          </button>

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
            <div className="rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center px-6 mx-auto w-48">
              {profile?.owner_name_english || "User Name"}
            </div>
            <div className="rounded-full bg-app text-app text-lg font-bold py-2 mb-4 flex items-center justify-center px-6 mx-auto w-48">
              {profile?.owner_name_chinese || "用户名"}
            </div>
          </div>

          <div className="relative w-full mb-6">
            <button
              aria-label="Scroll left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-1 bg-white/70 rounded-full ${
                canLeft ? "opacity-100" : "opacity-30 pointer-events-none"
              }`}
              onClick={() => {
                const el = iconsRef.current;
                if (!el) return;
                el.scrollBy({
                  left: -el.clientWidth * 0.6,
                  behavior: "smooth",
                });
                setTimeout(updateScroll, 300);
              }}
              style={{ display: showArrows ? "block" : "none" }}
            >
              <img src={leftArrow} alt="left" className="w-6 h-6" />
            </button>

            <div
              ref={iconsRef}
              onScroll={updateScroll}
              className="flex gap-4 px-4 overflow-x-auto no-scrollbar items-center"
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
                  src={companyIcon}
                  alt="Company"
                  className="w-9 h-9 object-contain"
                />
              </div>
              {profile?.WhatsApp && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  onClick={() => window.open(profile.WhatsApp, "_blank")}
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="2x" color="white" />
                </div>
              )}
              {profile?.tgid && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  onClick={() => window.open(profile.tgid, "_blank")}
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faTelegram} size="2x" color="white" />
                </div>
              )}
              {profile?.contact && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  onClick={() => window.open(`tel:${profile.contact}`, "_self")}
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                </div>
              )}
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
                  alt="Chamber"
                  className="w-9 h-9 object-contain"
                />
              </div>
            </div>

            <button
              aria-label="Scroll right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-1 bg-white/70 rounded-full ${
                canRight ? "opacity-100" : "opacity-30 pointer-events-none"
              }`}
              onClick={() => {
                const el = iconsRef.current;
                if (!el) return;
                el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
                setTimeout(updateScroll, 300);
              }}
              style={{ display: showArrows ? "block" : "none" }}
            >
              <img src={rightArrow} alt="right" className="w-6 h-6" />
            </button>
          </div>

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
                  } catch {
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
