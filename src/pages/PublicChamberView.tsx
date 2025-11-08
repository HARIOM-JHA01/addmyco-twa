import { useEffect, useState, useRef } from "react";
import ProfileIcon from "../assets/profileIcon.png";
import CompanyLogo from "../assets/company.svg";
import logo from "../assets/logo.png";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faTelegram,
  faYoutube,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faPhone } from "@fortawesome/free-solid-svg-icons";
import { callOrCopyPhone } from "../utils/phone";
import PublicLayout from "../components/PublicLayout";
import {
  PublicProfileData,
  CompanyData,
  ChamberData,
} from "../services/publicProfileService";
import { formatUrl } from "../utils/validation";
import WebApp from "@twa-dev/sdk";

interface PublicChamberViewProps {
  profile: PublicProfileData;
  companies: CompanyData[];
  chambers: ChamberData[];
  onViewChange: (view: "profile" | "company" | "chamber") => void;
}

export default function PublicChamberView({
  profile,
  companies,
  chambers,
  onViewChange,
}: PublicChamberViewProps) {
  const [currentChamberIndex, setCurrentChamberIndex] = useState(0);
  const topIconsRef = useRef<HTMLDivElement | null>(null);
  const [showTopArrows, setShowTopArrows] = useState(false);
  const [canTopLeft, setCanTopLeft] = useState(false);
  const [canTopRight, setCanTopRight] = useState(false);

  const c = chambers[currentChamberIndex] || null;

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
  }, [c]);

  if (chambers.length === 0) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">
            No chamber data found.
          </div>
        </div>
      </PublicLayout>
    );
  }

  const whatsappLink = profile.WhatsApp || null;
  const telegramLink = profile.telegramId || null;
  const contactNumber = profile.contact || null;

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center flex-grow px-2 pb-8 min-h-screen mt-2">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-4 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Chamber Top Icon Carousel */}
          <div className="relative w-full mb-2">
            <button
              aria-label="Top scroll left"
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 rounded-full"
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
              className="flex gap-4 px-6 overflow-x-auto no-scrollbar items-center"
              style={{
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory" as any,
              }}
            >
              {companies.length > 0 && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => onViewChange("company")}
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                    scrollSnapAlign: "center" as any,
                  }}
                >
                  <img
                    src={CompanyLogo}
                    alt="Company"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              )}
              {whatsappLink && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => window.open(formatUrl(whatsappLink), "_blank")}
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
              {telegramLink && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => window.open(formatUrl(telegramLink), "_blank")}
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
              {contactNumber && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => callOrCopyPhone(String(contactNumber))}
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
                  src={ProfileIcon}
                  alt="Profile"
                  className="w-9 h-9 object-contain"
                />
              </div>
            </div>
            <button
              aria-label="Top scroll right"
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 rounded-full"
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

          {/* Chamber Names with navigation arrows */}
          <div className="relative w-full mb-2">
            <div
              className="w-full rounded-full bg-app text-app text-xl font-bold py-2 flex items-center justify-center"
              style={{ borderRadius: "2rem" }}
            >
              {c.chamber_name_english}
            </div>
            <button
              aria-label="Prev chamber"
              className="absolute left-0 -translate-x-1/2 p-1 rounded-full"
              style={{
                top: "calc(50% + 2px)",
                display: currentChamberIndex > 0 ? "block" : "none",
              }}
              onClick={() => setCurrentChamberIndex((i) => Math.max(i - 1, 0))}
            >
              <FontAwesomeIcon icon={faChevronLeft} color="red" />
            </button>
            <button
              aria-label="Next chamber"
              className="absolute right-0 translate-x-1/2 p-1 rounded-full"
              style={{
                top: "calc(50% + 2px)",
                display:
                  currentChamberIndex < chambers.length - 1 ? "block" : "none",
              }}
              onClick={() =>
                setCurrentChamberIndex((i) =>
                  Math.min(i + 1, chambers.length - 1)
                )
              }
            >
              <FontAwesomeIcon icon={faChevronRight} color="red" />
            </button>
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {c.chamber_name_chinese}
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {c.chamberdesignation}
          </div>

          {/* Image or video */}
          <div className="flex flex-col items-center mb-2 w-full">
            <div className="w-full flex justify-center mb-2">
              {c.video && c.video.endsWith(".mp4") ? (
                <video
                  src={c.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : c.image ? (
                <img
                  src={c.image}
                  alt="chamber"
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : profile.theme?.Thumbnail ? (
                <img
                  src={profile.theme.Thumbnail}
                  alt="Chamber thumbnail"
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <img
                  src={logo}
                  alt="No chamber"
                  className="w-full h-48 object-cover rounded-xl bg-white"
                />
              )}
            </div>
            <div
              className="w-full h-48 bg-white rounded-md p-2 overflow-auto mb-2"
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor:
                  profile.theme?.backgroundcolor ||
                  "var(--app-background-color)",
              }}
            >
              {c.detail}
            </div>
          </div>

          {/* Bottom Icons */}
          <div className="w-full mb-6 flex items-center justify-between gap-3">
            {[
              {
                key: "telegram",
                enabled: !!c.tgchannel,
                icon: faTelegram,
                onClick: () => {
                  if (c.tgchannel) {
                    WebApp.openLink(`${c.tgchannel}`);
                  }
                },
              },
              {
                key: "facebook",
                enabled: !!c.Facebook,
                icon: faFacebook,
                onClick: () => window.open(formatUrl(c.Facebook!), "_blank"),
              },
              {
                key: "instagram",
                enabled: !!c.Instagram,
                icon: faInstagram,
                onClick: () => window.open(formatUrl(c.Instagram!), "_blank"),
              },
              {
                key: "youtube",
                enabled: !!c.Youtube,
                icon: faYoutube,
                onClick: () => window.open(formatUrl(c.Youtube!), "_blank"),
              },
              {
                key: "website",
                enabled: !!c.chamberwebsite,
                icon: faGlobe,
                onClick: () =>
                  window.open(formatUrl(c.chamberwebsite!), "_blank"),
              },
            ]
              .filter((item) => item.enabled)
              .map((item) => (
                <div
                  key={item.key}
                  className="w-12 h-12 flex-shrink-0 cursor-pointer rounded-full flex items-center justify-center"
                  onClick={item.onClick}
                  style={{
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} size="lg" color="white" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
