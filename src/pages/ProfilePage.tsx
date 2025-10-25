import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useProfileStore } from "../store/profileStore";
import logo from "../assets/logo.png";
import chamberIcon from "../assets/chamber.svg";
import company from "../assets/company.svg";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faTelegram,
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
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import i18n from "../i18n";
import WebApp from "@twa-dev/sdk";
import { formatUrl } from "../utils/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const setProfileStore = useProfileStore((state) => state.setProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const iconsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login again.");
        const res = await axios.get(`${API_BASE_URL}/getprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data.data);
        setProfileStore(res.data.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setProfileStore]);

  const updateIconScroll = () => {
    const el = iconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowArrows(overflow);
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateIconScroll();
    const onResize = () => updateIconScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [profile]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {loading ? (
            <div className="text-app text-lg">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : profile ? (
            <>
              <div className="flex flex-col w-full">
                <button
                  className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
                  style={{ borderRadius: "2rem", width: "100%" }}
                >
                  {profile?.companydata?.company_name_english || "Company Name"}
                </button>
                <button
                  className="w-full rounded-full bg-app text-app text-xl font-bold mb-2 py-2 flex items-center justify-center"
                  style={{ borderRadius: "2rem", width: "100%" }}
                >
                  {profile?.companydata?.company_name_chinese || "公司名称"}
                </button>
                <div className="rounded-full mb-2 w-[180px] h-[180px] flex items-center justify-center overflow-hidden bg-white self-center">
                  {profile.profile_image &&
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
                      src={profile.profile_image || logo}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center px-6 mx-auto w-48">
                    {profile.owner_name_english || "No Name"}
                  </div>
                  <div className="rounded-full bg-app text-app text-lg font-bold py-2 mb-4 flex items-center justify-center px-6 mx-auto w-48">
                    {profile.owner_name_chinese || ""}
                  </div>
                </div>
              </div>
              <div className="relative w-full mb-2">
                <div className="relative">
                  <button
                    aria-label="Scroll left"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-1 bg-white/10 rounded-full ${
                      canScrollLeft
                        ? "opacity-100"
                        : "opacity-30 pointer-events-none"
                    }`}
                    onClick={() => {
                      const el = iconsRef.current;
                      if (!el) return;
                      el.scrollBy({
                        left: -el.clientWidth * 0.6,
                        behavior: "smooth",
                      });
                      setTimeout(updateIconScroll, 300);
                    }}
                    style={{ display: showArrows ? "block" : "none" }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} color="red" />
                  </button>
                  <div
                    ref={iconsRef}
                    onScroll={updateIconScroll}
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
                        src={company}
                        alt="Company"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    {profile?.WhatsApp ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() =>
                          window.open(formatUrl(profile.WhatsApp), "_blank")
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
                    ) : null}
                    {profile?.telegramId ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() =>
                          WebApp.openTelegramLink(
                            `https://t.me/${profile.telegramId}`
                          )
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
                    ) : null}
                    {profile?.contact ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() =>
                          window.open(`tel:${profile.contact}`, "_self")
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
                    ) : null}
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
                        <FontAwesomeIcon
                          icon={faGlobe}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faFacebook}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faInstagram}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faYoutube}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faLinkedin}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faTwitter}
                          size="2x"
                          color="white"
                        />
                      </div>
                    )}
                    {profile?.Line && (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                        onClick={() =>
                          window.open(formatUrl(profile.Line), "_blank")
                        }
                        style={{
                          backgroundColor: "var(--app-background-color)",
                          scrollSnapAlign: "center" as any,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faLine}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faSnapchat}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faTiktok}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faWeixin}
                          size="2x"
                          color="white"
                        />
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
                        <FontAwesomeIcon
                          icon={faSkype}
                          size="2x"
                          color="white"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    aria-label="Scroll right"
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-1 bg-white/10 rounded-full ${
                      canScrollRight
                        ? "opacity-100"
                        : "opacity-30 pointer-events-none"
                    }`}
                    onClick={() => {
                      const el = iconsRef.current;
                      if (!el) return;
                      el.scrollBy({
                        left: el.clientWidth * 0.6,
                        behavior: "smooth",
                      });
                      setTimeout(updateIconScroll, 300);
                    }}
                    style={{ display: showArrows ? "block" : "none" }}
                  >
                    <FontAwesomeIcon icon={faChevronRight} color="red" />
                  </button>
                </div>
              </div>
              <div
                className="w-full rounded-md bg-white p-4 mb-4 shadow text-center"
                style={{
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: "var(--app-background-color)",
                }}
              >
                <div className="text-app">{profile.address1}</div>
                <div className="text-app">{profile.address2}</div>
                <div className="text-app">{profile.address3}</div>
              </div>
              <div
                className="mb-2 p-2 w-full bg-[#d50078] text-center text-white"
                onClick={() => navigate("/update-profile")}
              >
                {i18n.t("update_profile")}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
