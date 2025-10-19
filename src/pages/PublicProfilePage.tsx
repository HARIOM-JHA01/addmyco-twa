import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import company from "../assets/company.svg";
import chamber from "../assets/chamber.svg";
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
} from "../services/publicProfileService";
import { formatUrl } from "../utils/validation";

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

  return (
    <PublicLayout
      backgroundColor={profile.theme?.backgroundcolor}
      fontColor={profile.theme?.fontcolor}
    >
      <div className="flex flex-col items-center justify-center flex-grow px-2 pb-8 min-h-screen mt-2">
        <section className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Profile Image/Video */}
          <div className="mb-6 w-full flex justify-center">
            <div
              className="rounded-xl p-2 flex items-center justify-center"
              style={{ width: 200, height: 200 }}
            >
              {profile.video ? (
                <video
                  src={profile.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="object-contain mx-auto rounded-md w-full h-full"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="object-contain mx-auto rounded-md"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <img
                  src={logo}
                  alt="Default"
                  className="object-contain mx-auto rounded-md bg-white w-full"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </div>
          </div>

          {/* Owner Names */}
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-2 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {profile.owner_name_english || "Name"}
          </div>
          <div
            className="w-full rounded-full bg-app text-app text-xl font-bold py-2 mb-4 flex items-center justify-center"
            style={{ borderRadius: "2rem" }}
          >
            {profile.owner_name_chinese || "中文名字"}
          </div>

          {/* Icon Carousel */}
          <div className="relative w-full mb-6">
            <button
              aria-label="Scroll left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-1 bg-white/10 rounded-full`}
              style={{
                display: showArrows && canScrollLeft ? "block" : "none",
              }}
              onClick={() => {
                const el = iconsRef.current;
                if (!el) return;
                el.scrollBy({
                  left: -el.clientWidth * 0.6,
                  behavior: "smooth",
                });
                setTimeout(updateIconScroll, 300);
              }}
            >
              <img src={leftArrow} alt="left" className="w-6 h-6" />
            </button>
            <div
              ref={iconsRef}
              onScroll={updateIconScroll}
              className="flex gap-4 px-4 overflow-x-auto no-scrollbar items-center"
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
                    backgroundColor:
                      profile.theme?.backgroundcolor ||
                      "var(--app-background-color)",
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
              {hasChambers && (
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
                    src={chamber}
                    alt="Chamber"
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
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
                  onClick={() =>
                    window.open(`https://t.me/${profile.telegramId}`, "_blank")
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
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
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
              aria-label="Scroll right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-1 bg-white/10 rounded-full`}
              style={{
                display: showArrows && canScrollRight ? "block" : "none",
              }}
              onClick={() => {
                const el = iconsRef.current;
                if (!el) return;
                el.scrollBy({ left: el.clientWidth * 0.6, behavior: "smooth" });
                setTimeout(updateIconScroll, 300);
              }}
            >
              <img src={rightArrow} alt="right" className="w-6 h-6" />
            </button>
          </div>

          {/* Additional Social Media Icons */}
          <div className="w-full mb-6">
            <div className="relative w-full">
              <div className="flex items-center justify-between gap-3">
                {profile.Facebook && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Facebook!), "_blank")
                    }
                    style={{
                      backgroundColor:
                        profile.theme?.backgroundcolor ||
                        "var(--app-background-color)",
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
                      backgroundColor:
                        profile.theme?.backgroundcolor ||
                        "var(--app-background-color)",
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
                      backgroundColor:
                        profile.theme?.backgroundcolor ||
                        "var(--app-background-color)",
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
                      backgroundColor:
                        profile.theme?.backgroundcolor ||
                        "var(--app-background-color)",
                    }}
                  >
                    <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(profile.email ||
            profile.contact ||
            profile.address1 ||
            profile.address2 ||
            profile.address3) && (
            <div className="w-full bg-white rounded-xl p-4 mb-4">
              {profile.email && (
                <div className="mb-2">
                  <span className="font-semibold">Email: </span>
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.contact && (
                <div className="mb-2">
                  <span className="font-semibold">Contact: </span>
                  <span>{profile.contact}</span>
                </div>
              )}
              {profile.address1 && (
                <div className="mb-2">
                  <span className="font-semibold">Address: </span>
                  <span>{profile.address1}</span>
                </div>
              )}
              {profile.address2 && (
                <div className="mb-2">{profile.address2}</div>
              )}
              {profile.address3 && <div>{profile.address3}</div>}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
