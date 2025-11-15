import { useEffect, useState, useRef } from "react";
import profileIcon from "../assets/profileIcon.png";
import chamberIcon from "../assets/chamber.svg";
import logo from "../assets/logo.png";
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
} from "@fortawesome/free-brands-svg-icons";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import PublicLayout from "../components/PublicLayout";
import VideoPlayer from "../components/VideoPlayer";
import {
  PublicProfileData,
  CompanyData,
  ChamberData,
} from "../services/publicProfileService";
import { formatUrl } from "../utils/validation";
import { callOrCopyPhone } from "../utils/phone";
import WebApp from "@twa-dev/sdk";

interface PublicCompanyViewProps {
  profile: PublicProfileData;
  companies: CompanyData[];
  chambers: ChamberData[];
  onViewChange: (view: "profile" | "company" | "chamber") => void;
}

export default function PublicCompanyView({
  profile,
  companies,
  chambers,
  onViewChange,
}: PublicCompanyViewProps) {
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const topIconsRef = useRef<HTMLDivElement | null>(null);
  const [showTopArrows, setShowTopArrows] = useState(false);
  const [canTopLeft, setCanTopLeft] = useState(false);
  const [canTopRight, setCanTopRight] = useState(false);

  const companyProfile = companies[currentCompanyIndex] || null;

  const updateTopScroll = () => {
    const el = topIconsRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowTopArrows(overflow);
    setCanTopLeft(el.scrollLeft > 8);
    setCanTopRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateTopScroll();
    const onResize = () => updateTopScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [companyProfile]);

  if (companies.length === 0) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">
            No company profile found.
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-8">
        <section className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Top Icon Carousel */}
          <div className="relative w-full mb-4">
            <button
              aria-label="Top scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-1 bg-white/10 rounded-full"
              style={{
                display: showTopArrows && canTopLeft ? "block" : "none",
              }}
              onClick={() => {
                const el = topIconsRef.current;
                if (!el) return;
                el.scrollBy({
                  left: -el.clientWidth * 0.6,
                  behavior: "smooth",
                });
                setTimeout(updateTopScroll, 300);
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} color="red" />
            </button>
            <div
              ref={topIconsRef}
              onScroll={updateTopScroll}
              className="flex gap-4 px-4 overflow-x-hidden items-center no-scrollbar"
              style={{
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory" as any,
              }}
            >
              {/* Keep consistent order: profile, WhatsApp, Telegram, Phone, Chamber */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => onViewChange("profile")}
                style={{
                  backgroundColor:
                    profile.theme?.backgroundcolor ||
                    "var(--app-background-color)",
                  scrollSnapAlign: "center" as any,
                }}
              >
                <img
                  src={profileIcon}
                  alt="Profile"
                  className="w-9 h-9 object-contain"
                />
              </div>

              {profile.WhatsApp && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.WhatsApp!), "_blank")
                  }
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} size="2x" color="white" />
                </div>
              )}

              {profile.telegramId && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() =>
                    window.open(formatUrl(profile.telegramId!), "_blank")
                  }
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faTelegram} size="2x" color="white" />
                </div>
              )}

              {profile.contact && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => callOrCopyPhone(String(profile.contact))}
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                </div>
              )}

              {chambers.length > 0 && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => onViewChange("chamber")}
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <img
                    src={chamberIcon}
                    alt="Chamber"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              )}
            </div>
            <button
              aria-label="Top scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-1 bg-white/10 rounded-full"
              style={{
                display: showTopArrows && canTopRight ? "block" : "none",
              }}
              onClick={() => {
                const el = topIconsRef.current;
                if (!el) return;
                el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
                setTimeout(updateTopScroll, 300);
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} color="red" />
            </button>
          </div>

          {/* Company Names with navigation arrows */}
          <div className="relative w-full mb-2">
            <div
              className="w-full rounded-full bg-app text-app text-xl font-bold py-1 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {companyProfile.company_name_english || "Company Name"}
            </div>
            <button
              aria-label="Prev company"
              className="absolute left-0 -translate-x-1/2 p-1 rounded-full"
              style={{
                top: "calc(50% + 2px)",
                display: currentCompanyIndex > 0 ? "block" : "none",
              }}
              onClick={() => setCurrentCompanyIndex((i) => Math.max(i - 1, 0))}
            >
              <FontAwesomeIcon icon={faChevronLeft} color="red" />
            </button>
            <button
              aria-label="Next company"
              className="absolute right-0 translate-x-1/2 p-1 rounded-full"
              style={{
                top: "calc(50% + 2px)",
                display:
                  currentCompanyIndex < companies.length - 1 ? "block" : "none",
              }}
              onClick={() =>
                setCurrentCompanyIndex((i) =>
                  Math.min(i + 1, companies.length - 1)
                )
              }
            >
              <FontAwesomeIcon icon={faChevronRight} color="red" />
            </button>
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyProfile.company_name_chinese || "中文公司名稱"}
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyProfile.companydesignation || "Company Designation"}
          </div>

          {/* Company Image and Description */}
          <div className="flex flex-col items-center mb-2 w-full">
            <div className="w-full flex justify-center mb-4">
              {companyProfile.video ? (
                <VideoPlayer
                  src={companyProfile.video}
                  loop
                  playsInline
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : companyProfile.image ? (
                companyProfile.image.endsWith(".mp4") ? (
                  <VideoPlayer
                    src={companyProfile.image}
                    loop
                    playsInline
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={companyProfile.image}
                    alt="company"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )
              ) : profile.theme?.Thumbnail ? (
                <img
                  src={profile.theme.Thumbnail}
                  alt="Company thumbnail"
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <img
                  src={logo}
                  alt="No company"
                  className="w-full h-48 object-cover rounded-xl bg-white"
                />
              )}
            </div>
            <div
              className="w-full h-48 bg-white rounded-md p-2 overflow-auto text-black"
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                backgroundColor: "#fff",
              }}
            >
              {companyProfile.description || "No description available"}
            </div>
          </div>

          {/* Bottom Icons */}
          <div className="w-full mb-6 flex items-center justify-between gap-3">
            {[
              {
                key: "telegram",
                enabled: !!companyProfile.telegramId,
                icon: faTelegram,
                onClick: () => {
                  if (companyProfile.telegramId) {
                    WebApp.openLink(`${companyProfile.telegramId}`);
                  }
                },
              },
              {
                key: "facebook",
                enabled: !!companyProfile.Facebook,
                icon: faFacebook,
                onClick: () =>
                  window.open(formatUrl(companyProfile.Facebook!), "_blank"),
              },
              {
                key: "instagram",
                enabled: !!companyProfile.Instagram,
                icon: faInstagram,
                onClick: () =>
                  window.open(formatUrl(companyProfile.Instagram!), "_blank"),
              },
              {
                key: "youtube",
                enabled: !!companyProfile.Youtube,
                icon: faYoutube,
                onClick: () =>
                  window.open(formatUrl(companyProfile.Youtube!), "_blank"),
              },
              {
                key: "website",
                enabled: !!companyProfile.website,
                icon: faGlobe,
                onClick: () =>
                  window.open(formatUrl(companyProfile.website!), "_blank"),
              },
            ]
              .filter((item) => item.enabled)
              .map((item) => (
                <div
                  key={item.key}
                  className={`w-12 h-12 flex-shrink-0 ${
                    item.enabled
                      ? "cursor-pointer"
                      : "opacity-40 pointer-events-none"
                  }`}
                  onClick={item.onClick}
                  style={{ padding: 3 }}
                >
                  <div
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      backgroundColor:
                        profile.theme?.backgroundcolor ||
                        "var(--app-background-color)",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        clipPath:
                          "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        size="lg"
                        color="white"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
