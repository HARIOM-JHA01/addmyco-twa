import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import company from "../assets/company.svg";
import chamber from "../assets/chamber.svg";
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
import {
  fetchPublicProfile,
  PublicProfileData,
} from "../services/publicProfileService";
import { formatUrl, formatImageUrl } from "../utils/validation";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const iconsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

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

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">Loading profile...</div>
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

  const hasCompanies = profile.userDoc && profile.userDoc.length > 0;
  const hasChambers = profile.chamberDoc && profile.chamberDoc.length > 0;
  const firstCompany =
    hasCompanies && profile.userDoc ? profile.userDoc[0] : null;

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <div className="flex flex-col w-full">
            <button
              className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
              style={{ borderRadius: "2rem", width: "100%" }}
            >
              {firstCompany?.company_name_english ||
                profile.companydata?.company_name_english ||
                "Company Name"}
            </button>
            <button
              className="w-full rounded-full bg-app text-app text-xl font-bold mb-2 py-2 flex items-center justify-center"
              style={{ borderRadius: "2rem", width: "100%" }}
            >
              {firstCompany?.company_name_chinese ||
                profile.companydata?.company_name_chinese ||
                "公司名称"}
            </button>
            <div className="rounded-full mb-2 w-[180px] h-[180px] flex items-center justify-center overflow-hidden bg-white self-center">
              {profile.profile_image &&
              profile.profile_image.endsWith(".mp4") ? (
                <video
                  src={formatImageUrl(profile.profile_image)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <img
                  src={formatImageUrl(profile.profile_image) || logo}
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
                className="flex gap-4 px-4 overflow-x-hidden items-center"
                style={{
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory" as any,
                }}
              >
                {hasCompanies && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => navigate(`/${username}/company`)}
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
                )}
                {profile.WhatsApp && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() =>
                      window.open(formatUrl(profile.WhatsApp!), "_blank")
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
                )}
                {profile.telegramId && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() =>
                      window.open(
                        `https://t.me/${profile.telegramId}`,
                        "_blank"
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
                )}
                {profile.contact && (
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
                    <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                  </div>
                )}
                {hasChambers && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => navigate(`/${username}/chamber`)}
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <img
                      src={chamber}
                      alt="Chamber"
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                )}
                {profile.website && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.website!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                  </div>
                )}
                {profile.Facebook && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Facebook!), "_blank")
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
                {profile.Instagram && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Instagram!), "_blank")
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
                {profile.Youtube && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Youtube!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faYoutube} size="2x" color="white" />
                  </div>
                )}
                {profile.Linkedin && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Linkedin!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
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
        </div>
      </div>
    </PublicLayout>
  );
}
