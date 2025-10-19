import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import profileIcon from "../assets/profileIcon.png";
import chamberIcon from "../assets/chamber.svg";
import logo from "../assets/logo.png";
import leftArrow from "../assets/left-arrow.png";
import rightArrow from "../assets/right-arrow.png";
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
import {
  fetchPublicProfile,
  PublicProfileData,
  CompanyData,
} from "../services/publicProfileService";
import { formatUrl } from "../utils/validation";

export default function PublicCompanyPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await fetchPublicProfile(username);
        setProfile(data);

        // Sort companies by company_order
        if (data.userDoc && data.userDoc.length > 0) {
          const sorted = [...data.userDoc].sort((a, b) => {
            const ao = Number(a.company_order ?? 0);
            const bo = Number(b.company_order ?? 0);
            return ao - bo;
          });
          setCompanies(sorted);
        } else {
          setCompanies([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">Loading company...</div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Profile Not Found
            </h1>
            <p className="text-gray-600">
              {error || "The requested profile does not exist."}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (companies.length === 0) {
    return (
      <PublicLayout
        backgroundColor={profile.theme?.backgroundcolor}
        fontColor={profile.theme?.fontcolor}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">
            No company profile found.
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout
      backgroundColor={profile.theme?.backgroundcolor}
      fontColor={profile.theme?.fontcolor}
    >
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
              <img src={leftArrow} alt="left" className="w-6 h-6" />
            </button>
            <div
              ref={topIconsRef}
              onScroll={updateTopScroll}
              className="flex gap-4 px-4 overflow-x-hidden items-center"
              style={{
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory" as any,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => navigate(`/${username}`)}
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
              {profile.chamberDoc && profile.chamberDoc.length > 0 && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() => navigate(`/${username}/chamber`)}
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
                  onClick={() => window.open(`tel:${profile.contact}`, "_self")}
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
              <img src={rightArrow} alt="right" className="w-6 h-6" />
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
              <img src={leftArrow} alt="prev" className="w-6 h-6" />
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
              <img src={rightArrow} alt="next" className="w-6 h-6" />
            </button>
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyProfile.company_name_chinese || "中文公司名稱"}
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-1 mb-4 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {companyProfile.companydesignation || "Company Designation"}
          </div>

          {/* Company Image and Description */}
          <div className="flex flex-col items-center mb-6 w-full">
            <div className="w-full flex justify-center mb-4">
              <div
                className="rounded-xl p-2 flex items-center justify-center w-full"
                style={{ height: 200 }}
              >
                {companyProfile.image ? (
                  companyProfile.image.endsWith(".mp4") ? (
                    <video
                      src={companyProfile.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="object-contain mx-auto rounded-md w-full h-full"
                    />
                  ) : (
                    <img
                      src={companyProfile.image}
                      alt="company"
                      className="object-contain mx-auto rounded-md"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  )
                ) : (
                  <img
                    src={logo}
                    alt="No company"
                    className="object-contain mx-auto rounded-md bg-white w-full"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                )}
              </div>
            </div>
            <div
              className="w-full h-48 bg-white rounded-md p-2 overflow-auto"
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor:
                  profile.theme?.backgroundcolor ||
                  "var(--app-background-color)",
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
                    const id = (companyProfile.telegramId || "").replace(
                      /^@/,
                      ""
                    );
                    window.open(`https://t.me/${id}`, "_blank");
                  }
                },
              },
              {
                key: "facebook",
                enabled: !!companyProfile.facebook,
                icon: faFacebook,
                onClick: () =>
                  window.open(formatUrl(companyProfile.facebook!), "_blank"),
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
        </section>
      </div>
    </PublicLayout>
  );
}
