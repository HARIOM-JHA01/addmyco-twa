import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import logo from "../assets/logo.png";
import company from "../assets/company.svg";
import chamber from "../assets/chamber.svg";
import {
  faChevronLeft,
  faChevronRight,
  faUserPlus,
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
import { callOrCopyPhone } from "../utils/phone";
import PublicLayout from "../components/PublicLayout";
import {
  PublicProfileData,
  CompanyData,
  ChamberData,
} from "../services/publicProfileService";
import { formatUrl, formatImageUrl } from "../utils/validation";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

interface PublicProfileViewProps {
  profile: PublicProfileData;
  companies: CompanyData[];
  chambers: ChamberData[];
  onViewChange: (view: "profile" | "company" | "chamber") => void;
}

export default function PublicProfileView({
  profile,
  companies,
  chambers,
  onViewChange,
}: PublicProfileViewProps) {
  const navigate = useNavigate();
  const iconsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  const [isContact, setIsContact] = useState<boolean | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://admin.addmy.co";
  const profileUrl = `https://addmy.co/t.me/${profile.username}`;

  const location = useLocation();

  const handleAddToContact = async () => {
    try {
      setIsAddingContact(true);

      let token = localStorage.getItem("token");

      if (!token) {
        WebApp.ready();

        let user: any = null;
        try {
          if (
            WebApp.initData &&
            typeof WebApp.initData === "object" &&
            (WebApp.initData as any).user
          ) {
            user = (WebApp.initData as any).user;
          } else if (
            WebApp.initDataUnsafe &&
            (WebApp.initDataUnsafe as any).user
          ) {
            user = (WebApp.initDataUnsafe as any).user;
          }
        } catch (e) {
          console.debug("Error reading Telegram init data", e);
        }

        const username = user?.username;
        if (!username) {
          WebApp.showAlert("No Telegram username available.");
          setIsAddingContact(false);
          return;
        }

        let country = "";
        let countryCode = "";
        try {
          if (navigator.onLine) {
            const countryResponse = await axios.get("https://ipapi.co/json/");
            country = countryResponse?.data?.country_name || "";
            countryCode = countryResponse?.data?.country_code || "";
          }
        } catch (e) {
          console.debug("Failed to fetch country:", e);
        }

        const loginResponse = await axios.post(
          `${API_BASE_URL}/telegram-login`,
          {
            telegram_username: username,
            country: country || "India",
            countryCode: countryCode || "IN",
          }
        );

        if (loginResponse.data && loginResponse.data.success) {
          token = loginResponse.data.data.token;
          if (token) {
            localStorage.setItem("token", token);
          }
        } else {
          WebApp.showAlert("Login failed. Please try again.");
          setIsAddingContact(false);
          return;
        }

        if (!token) {
          WebApp.showAlert("Failed to get authentication token.");
          setIsAddingContact(false);
          return;
        }
      }

      try {
        const profileRes = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myProfile = profileRes?.data?.data || null;

        const companyRes = await axios.get(
          `${API_BASE_URL}/getcompanyprofile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let myCompanies: any = companyRes?.data?.data || companyRes?.data || [];
        if (myCompanies && !Array.isArray(myCompanies))
          myCompanies = [myCompanies];

        const hasPersonal = !!myProfile && Object.keys(myProfile).length > 0;
        const hasCompany = Array.isArray(myCompanies) && myCompanies.length > 0;

        if (!hasPersonal || !hasCompany) {
          WebApp.showAlert(
            "Before adding this to your contact, you must complete your profile and revisit the link again"
          );
          setTimeout(() => {
            try {
              navigate("/create-profile");
            } catch (e) {
              window.location.href = "/create-profile";
            }
          }, 400);
          setIsAddingContact(false);
          return;
        }
      } catch (verifyErr) {
        console.warn("Verification of profile/company failed:", verifyErr);
      }

      const response = await axios.post(
        `${API_BASE_URL}/addtocontact`,
        { contact_id: profile._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.success) {
        WebApp.showAlert(response.data.message);
        // mark as contact locally so button hides
        setIsContact(true);
      }
      // Force a full page reload to /profile to ensure proper route handling
      setTimeout(() => {
        try {
          window.location.href = "/profile";
        } catch (e) {
          console.debug("Failed to redirect to profile");
        }
      }, 500);
    } catch (error: any) {
      console.error("Failed to add contact:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        WebApp.showAlert("Session expired. Please try again.");
      } else {
        WebApp.showAlert(
          error.response?.data?.message || "Failed to add contact"
        );
      }
    } finally {
      setIsAddingContact(false);
    }
  };

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
    // determine login state if needed (not used here)
    // initialize isContact from navigation state if provided
    try {
      const navState: any = (location && (location as any).state) || null;
      const params = new URLSearchParams(location.search || "");
      const from = params.get("from");
      if (navState && typeof navState.isContact !== "undefined") {
        setIsContact(!!navState.isContact);
      } else if (from === "contacts") {
        // treat links coming from the contacts list as already-in-contacts
        setIsContact(true);
      } else {
        // fallback: check localStorage flag set by ContactPage (short-lived)
        try {
          const last = localStorage.getItem("lastContactNavigate");
          if (last && profile && String(profile.username) === String(last)) {
            setIsContact(true);
            localStorage.removeItem("lastContactNavigate");
          } else {
            setIsContact(null);
          }
        } catch (e) {
          setIsContact(null);
        }
      }
    } catch (e) {
      setIsContact(null);
    }
    return () => window.removeEventListener("resize", onResize);
  }, [profile]);

  useEffect(() => {
    // If navigation did not provide isContact, and we have a token, fetch it
    (async () => {
      try {
        if (isContact === null) {
          const token = localStorage.getItem("token");
          if (!token) return;

          // First, fetch the full contact list and check for this profile
          try {
            const contactsRes = await axios.get(`${API_BASE_URL}/getcontact`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const contacts = contactsRes?.data?.data || [];
            let found = false;
            for (const c of contacts) {
              const ud = c?.userdetails?.[0];
              if (!ud) continue;
              // match by user _id / username / owner_name_english (case-insensitive)
              if (
                String(ud._id) === String(profile._id) ||
                (ud.username &&
                  profile.username &&
                  ud.username === profile.username) ||
                (ud.owner_name_english &&
                  profile.owner_name_english &&
                  String(ud.owner_name_english).trim().toLowerCase() ===
                    String(profile.owner_name_english).trim().toLowerCase())
              ) {
                found = true;
                break;
              }
            }
            if (found) {
              setIsContact(true);
              return;
            }
          } catch (e) {
            // ignore and fallback to individual check below
            console.debug("getcontact fetch failed, falling back", e);
          }

          // Fallback: call iscontactexist endpoint if getcontact didn't confirm
          try {
            const res = await axios.post(
              `${API_BASE_URL}/iscontactexist/${encodeURIComponent(
                profile.username
              )}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (
              res.status === 200 &&
              typeof res.data?.isContact !== "undefined"
            ) {
              setIsContact(!!res.data.isContact);
            } else {
              setIsContact(false);
            }
          } catch (e: any) {
            if (e?.response?.status === 404) {
              setIsContact(false);
            } else {
              console.warn(
                "iscontactexist check failed",
                e?.response?.status || e
              );
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [isContact, profile.username]);

  const hasCompanies = companies && companies.length > 0;
  const hasChambers = chambers && chambers.length > 0;
  const firstCompany = hasCompanies ? companies[0] : null;

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
              {profile.video ? (
                <video
                  src={formatImageUrl(profile.video)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-full"
                />
              ) : profile.profile_image ? (
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
                )
              ) : (
                <img
                  src={logo}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>
            <div className="flex flex-col items-center w-full">
              <button
                className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {profile.owner_name_english || "No Name"}
              </button>
              <button
                className="w-full rounded-full bg-app text-app text-lg font-bold py-2 mb-2 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {profile.owner_name_chinese || ""}
              </button>
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
                {hasCompanies && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2 overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => onViewChange("company")}
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
                    onClick={() => callOrCopyPhone(String(profile.contact))}
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
                    onClick={() => onViewChange("chamber")}
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
                    <FontAwesomeIcon
                      icon={faLinkedin}
                      size="2x"
                      color="white"
                    />
                  </div>
                )}
                {profile.Twitter && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Twitter!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faTwitter} size="2x" color="white" />
                  </div>
                )}
                {profile.Line && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Line!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faLine} size="2x" color="white" />
                  </div>
                )}
                {profile.SnapChat && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.SnapChat!), "_blank")
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
                {profile.TikTok && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.TikTok!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faTiktok} size="2x" color="white" />
                  </div>
                )}
                {profile.WeChat && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.WeChat!), "_blank")
                    }
                    style={{
                      backgroundColor: "var(--app-background-color)",
                      scrollSnapAlign: "center" as any,
                    }}
                  >
                    <FontAwesomeIcon icon={faWeixin} size="2x" color="white" />
                  </div>
                )}
                {profile.Skype && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      window.open(formatUrl(profile.Skype!), "_blank")
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
            className="w-full rounded-md bg-white p-4 mb-2 shadow text-center"
            style={{
              borderWidth: 2,
              borderStyle: "solid",
              backgroundColor: "var(--app-background-color)",
            }}
          >
            <div className="text-app">{profile.address1}</div>
            <div className="text-app">{profile.address2}</div>
            <div className="text-app">{profile.address3}</div>
          </div>

          {/* QR Code centered with + button beside it (normal flow) */}
          <div className="w-full mb-2 relative flex items-center justify-center">
            <div className="p-2 bg-white">
              <QRCodeSVG
                value={profileUrl}
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

            {isContact !== true && (
              <button
                onClick={handleAddToContact}
                disabled={isAddingContact}
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--app-background-color)",
                  position: "absolute",
                  left: `calc(50% + ${160 / 2 + 16}px)`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                aria-label="Add to contacts"
              >
                <FontAwesomeIcon icon={faUserPlus} size="lg" color="white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
