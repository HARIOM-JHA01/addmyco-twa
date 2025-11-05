import { useEffect, useState, useRef } from "react";
import logo from "../assets/logo.png";
import chamberIcon from "../assets/chamber.svg";
import companyIcon from "../assets/company.svg";
import { Share2, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTelegram,
  faWhatsapp,
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter,
  faLinkedin,
  faLine,
  faSnapchat,
  faTiktok,
  faWeixin,
  faSkype,
} from "@fortawesome/free-brands-svg-icons";
import {
  faPhone,
  faChevronLeft,
  faChevronRight,
  faGlobe,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { formatUrl } from "../utils/validation";
import { callOrCopyPhone } from "../utils/phone";
import WebApp from "@twa-dev/sdk";

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

  const qrRef = useRef<HTMLDivElement | null>(null);

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

  const handleShare = async () => {
    // Show share options modal instead of immediate Telegram-only share
    setShowShareModal(true);
  };

  const [showShareModal, setShowShareModal] = useState(false);

  const copyDetailsToClipboard = async (detailsText: string) => {
    try {
      await navigator.clipboard.writeText(detailsText);
      WebApp.showAlert("Details copied to clipboard!");
    } catch (clipErr) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = detailsText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        WebApp.showAlert("Details copied to clipboard!");
      } catch (err) {
        console.error("Clipboard failed:", err);
        WebApp.showAlert("Unable to copy details");
      }
    }
  };

  // Native share removed per request

  const shareToTelegram = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const name =
      profile?.owner_name_english ||
      profile?.owner_name_chinese ||
      profile?.owner_name ||
      "";
    const company =
      profile?.companydata?.company_name_english ||
      profile?.companydata?.company_name_chinese ||
      profile?.companydata?.company_name ||
      "";
    const designation =
      profile?.companydata?.companydesignation ||
      profile?.designation ||
      profile?.title ||
      "";
    const detailsText = `Name : ${name}\nCompany name : ${company}\nDesignation: ${designation}\nAddmyCo address : ${qrLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      qrLink
    )}&text=${encodeURIComponent(detailsText)}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const shareToWhatsApp = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const text = `Check this profile: ${qrLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const shareToFacebook = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      qrLink
    )}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const shareToTwitter = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const text = `Check this profile: ${qrLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const shareToLinkedIn = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      qrLink
    )}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const shareToInstagram = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    if (profile?.Instagram) {
      window.open(formatUrl(profile.Instagram), "_blank");
    } else {
      copyDetailsToClipboard(qrLink);
      WebApp.showAlert("Profile link copied. Paste it in Instagram to share.");
    }
    setShowShareModal(false);
  };

  const shareToWeChat = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    copyDetailsToClipboard(qrLink);
    WebApp.showAlert("Profile link copied. Open WeChat and paste to share.");
    setShowShareModal(false);
  };

  const shareToLine = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      qrLink
    )}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const copyDetails = () => {
    const origin = "https://addmy.co";
    const username =
      profile?.username || profile?.telegram_username || profile?.tgid || "";
    const qrLink = username ? `${origin}/t.me/${username}` : origin;
    const name =
      profile?.owner_name_english ||
      profile?.owner_name_chinese ||
      profile?.owner_name ||
      "";
    const company =
      profile?.companydata?.company_name_english ||
      profile?.companydata?.company_name_chinese ||
      profile?.companydata?.company_name ||
      "";
    const designation =
      profile?.companydata?.companydesignation ||
      profile?.designation ||
      profile?.title ||
      "";
    const detailsText = `Name : ${name}\nCompany name : ${company}\nDesignation: ${designation}\nAddmyCo address : ${qrLink}`;
    copyDetailsToClipboard(detailsText);
    setShowShareModal(false);
  };

  const handleScan = () => {
    try {
      WebApp.showScanQrPopup(
        {
          text: "Scan QR Code", // Optional text to display
        },
        (text) => {
          // Callback when QR is scanned
          if (text) {
            // Close the popup
            WebApp.closeScanQrPopup();

            // Handle the scanned text
            // If it's a profile URL, navigate to it
            if (text.includes("addmy.co/")) {
              // Extract remainder after addmy.co/
              const idx = text.indexOf("addmy.co/");
              let remainder = text.substring(idx + "addmy.co/".length);
              // Trim leading slashes
              remainder = remainder.replace(/^\/+/, "");
              // If remainder starts with t.me/ (or telegram shortlink), strip that prefix
              if (remainder.startsWith("t.me/")) {
                remainder = remainder.substring("t.me/".length);
              }
              // Strip any trailing path, query or fragment so we only keep the username
              const username = remainder.split(/[\/?#]/)[0];
              if (username) {
                // Before navigating, check whether this user is already in our contacts
                // so the profile page can decide whether to show the + (add) button.
                (async () => {
                  try {
                    const token = localStorage.getItem("token");
                    let isContact = false;
                    if (token) {
                      try {
                        const res = await axios.post(
                          `${API_BASE_URL}/iscontactexist/${encodeURIComponent(
                            username
                          )}`,
                          {},
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        if (
                          res.status === 200 &&
                          res.data &&
                          typeof res.data.isContact !== "undefined"
                        ) {
                          isContact = !!res.data.isContact;
                        }
                      } catch (e: any) {
                        // If 404 or other error, treat as not contact but still navigate
                        if (e?.response?.status === 404) {
                          isContact = false;
                        } else {
                          console.warn(
                            "iscontactexist check failed",
                            e?.response?.status || e
                          );
                        }
                      }
                    }
                    // Pass isContact via location state so the profile page can use it
                    navigate(`/${username}`, { state: { isContact } });
                  } catch (err) {
                    console.error("Failed to check contact existence", err);
                    navigate(`/${username}`);
                  }
                })();
              }
            } else if (
              text.startsWith("http://") ||
              text.startsWith("https://")
            ) {
              // If it's a URL, open it
              window.open(text, "_blank");
            } else {
              // Show the scanned text
              WebApp.showAlert(`Scanned: ${text}`);
            }
          }
          return true; // Return true to close the popup
        }
      );
    } catch (error) {
      console.error("QR Scanner error:", error);
      WebApp.showAlert("QR Scanner is not available in this environment");
    }
  };

  if (loading) {
    return (
      <div
        className="bg-cover bg-center min-h-screen w-full overflow-x-hidden flex items-center justify-center"
        style={{ backgroundImage: "var(--app-background-image)" }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const companyData = profile?.companydata;
  const origin = "https://addmy.co";
  const username =
    profile?.username || profile?.telegram_username || profile?.tgid || "";
  const qrLink = username ? `${origin}/t.me/${username}` : origin;

  return (
    <div
      className="bg-cover bg-center min-h-screen w-full overflow-x-hidden"
      style={{ backgroundImage: "var(--app-background-image)" }}
    >
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

          <div className="flex flex-col items-center w-full">
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
                  src={logo}
                  alt="Default Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>
            <button
              className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {profile?.owner_name_english || "User Name"}
            </button>
            <button
              className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {profile?.owner_name_chinese || "用户名"}
            </button>
          </div>

          <div className="relative w-full mb-2">
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
              <FontAwesomeIcon icon={faChevronLeft} color="red" />
            </button>

            <div
              ref={iconsRef}
              onScroll={updateScroll}
              className="flex gap-5 items-center no-scrollbar"
              style={{
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory" as any,
                overflowX: "auto",
                paddingLeft: showArrows ? 28 : 8,
                paddingRight: showArrows ? 48 : 8,
                WebkitOverflowScrolling: "touch",
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
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.WhatsApp), "_blank")
                  }
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
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => window.open(formatUrl(profile.tgid), "_blank")}
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
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => callOrCopyPhone(String(profile.contact))}
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
              {profile?.website && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.website), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                </div>
              )}
              {profile?.Facebook && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Facebook), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faFacebook} size="2x" color="white" />
                </div>
              )}
              {profile?.Instagram && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Instagram), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faInstagram} size="2x" color="white" />
                </div>
              )}
              {profile?.Youtube && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Youtube), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faYoutube} size="2x" color="white" />
                </div>
              )}
              {profile?.Linkedin && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Linkedin), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faLinkedin} size="2x" color="white" />
                </div>
              )}
              {profile?.Twitter && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Twitter), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faTwitter} size="2x" color="white" />
                </div>
              )}
              {profile?.Line && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => window.open(formatUrl(profile.Line), "_blank")}
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faLine} size="2x" color="white" />
                </div>
              )}
              {profile?.SnapChat && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.SnapChat), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faSnapchat} size="2x" color="white" />
                </div>
              )}
              {profile?.TikTok && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.TikTok), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faTiktok} size="2x" color="white" />
                </div>
              )}
              {profile?.WeChat && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.WeChat), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faWeixin} size="2x" color="white" />
                </div>
              )}
              {profile?.Skype && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.Skype), "_blank")
                  }
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faSkype} size="2x" color="white" />
                </div>
              )}
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
              <FontAwesomeIcon icon={faChevronRight} color="red" />
            </button>
          </div>

          {(profile?.address1 || profile?.address2 || profile?.address3) && (
            <div
              className="w-full rounded-md bg-white p-4 mb-2 shadow text-center"
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

          <div className="flex items-center justify-center mb-4 w-full mt-2 gap-2">
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-app rounded-full flex items-center justify-center hover:opacity-90 transition"
              aria-label="Share"
              style={{ marginRight: 8 }}
            >
              <Share2 className="w-6 h-6 text-app" />
            </button>

            <div ref={qrRef} className="p-2 bg-white">
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

            <button
              onClick={handleScan}
              className="w-12 h-12 bg-app rounded-full flex items-center justify-center hover:opacity-90 transition"
              aria-label="Scan"
              style={{ marginLeft: 8 }}
            >
              <Camera className="w-6 h-6 text-app" />
            </button>
          </div>
          {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-lg p-4 w-full max-w-sm">
                <div className="text-lg font-semibold mb-3">Share profile</div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button
                    onClick={shareToWhatsApp}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                    <div className="text-xs mt-1">WhatsApp</div>
                  </button>
                  <button
                    onClick={shareToTelegram}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTelegram} />
                    <div className="text-xs mt-1">Telegram</div>
                  </button>
                  <button
                    onClick={shareToInstagram}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                    <div className="text-xs mt-1">Instagram</div>
                  </button>

                  <button
                    onClick={shareToFacebook}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                    <div className="text-xs mt-1">Facebook</div>
                  </button>
                  <button
                    onClick={shareToWeChat}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faWeixin} />
                    <div className="text-xs mt-1">WeChat</div>
                  </button>
                  <button
                    onClick={shareToLine}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faLine} />
                    <div className="text-xs mt-1">Line</div>
                  </button>

                  <button
                    onClick={shareToLinkedIn}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faLinkedin} />
                    <div className="text-xs mt-1">LinkedIn</div>
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                    <div className="text-xs mt-1">X</div>
                  </button>
                  <button
                    onClick={copyDetails}
                    className="p-2 bg-app text-white rounded flex flex-col items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faClipboard} />
                    <div className="text-xs mt-1">Copy</div>
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-3 py-1 rounded bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
