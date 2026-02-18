import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import SubCompanyPage from "./pages/SubCompany";
import ChamberPage from "./pages/ChamberPage";
import CreateChamberPage from "./pages/CreateChamberPage";
import ContactPage from "./pages/ContactPage";
import MyQRPage from "./pages/MyQRPage";
import CreateProfile from "./pages/createProfile";
import ThemePage from "./pages/ThemePage";
import WelcomePage from "./pages/WelcomePage";
import MembershipPage from "./pages/MembershipPage";
import EnterprisePage from "./pages/EnterprisePage";
import OperatorDashboardPage from "./pages/OperatorDashboardPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import AdvertisementPage from "./pages/AdvertisementPage";
import AdvertisementFAQPage from "./pages/AdvertisementFAQPage";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import CreateCompanyPage from "./pages/CreateCompanyPage";
import BackgroundPage from "./pages/BackgroundPage";
import HomePage from "./pages/HomePage";
import PublicProfileContainer from "./pages/PublicProfileContainer";
import { fetchBackgroundByUsername as fetchBgByUsername } from "./utils/theme";
import WelcomePopup from "./components/WelcomePopup";
import PartnerCodePopup from "./components/PartnerCodePopup";
import { BottomCircleAdProvider } from "./contexts/BottomCircleAdContext";
import { useProfileStore } from "./store/profileStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  // Check for operator session immediately on initialization
  const operatorFlag = localStorage.getItem("operator_logged_in");
  const hasToken = !!localStorage.getItem("token");
  const isOperator = operatorFlag === "true" && hasToken;

  const [showWelcome, setShowWelcome] = useState(!isOperator);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showPartnerPopup, setShowPartnerPopup] = useState(false);
  const [partnerPopupResolver, setPartnerPopupResolver] = useState<
    ((code: string | null) => void) | null
  >(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(!isOperator);
  const [deepLinkPartnerCode, setDeepLinkPartnerCode] = useState<string | null>(
    null,
  );
  // Check for operator session immediately on initialization
  const [isOperatorSession, setIsOperatorSession] = useState(() => {
    const operatorFlag = localStorage.getItem("operator_logged_in");
    const hasToken = !!localStorage.getItem("token");
    return operatorFlag === "true" && hasToken;
  });

  const fetchBackgroundByUsername = fetchBgByUsername;

  // Check for operator login flag on mount and navigate
  useEffect(() => {
    const operatorFlag = localStorage.getItem("operator_logged_in");
    const hasToken = !!localStorage.getItem("token");

    if (operatorFlag === "true" && hasToken) {
      // Clear the flag immediately
      localStorage.removeItem("operator_logged_in");
      // Set operator session flag
      setIsOperatorSession(true);
      setShowWelcome(false);
      setProfileLoading(false);
      // Navigate to operator dashboard
      navigate("/operator-dashboard", { replace: true });
    }
  }, [navigate]);

  // Handle Telegram startParam (when app is opened via Telegram deep link)
  useEffect(() => {
    try {
      const startParam = WebApp.initDataUnsafe?.start_param;
      const hasToken = !!localStorage.getItem("token");
      const path = location.pathname || "/";

      console.log(
        "Checking startParam:",
        startParam,
        "hasToken:",
        hasToken,
        "path:",
        path,
      );

      const atAppRoot = path === "/" || path === "/start" || path === "";
      const alreadyHandled =
        sessionStorage.getItem("start_param_handled") === "1";

      if (startParam && !hasToken && atAppRoot && !alreadyHandled) {
        sessionStorage.setItem("start_param_handled", "1");

        const decodedParam = decodeURIComponent(startParam);
        console.log("Decoded startParam:", decodedParam);

        // Check if it's a partner code (starts with "ref-")
        if (decodedParam.startsWith("ref-")) {
          const partnerCode = decodedParam.replace("ref-", "");
          console.log("Partner code detected from startParam:", partnerCode);
          setDeepLinkPartnerCode(partnerCode);
          // Stay on welcome page by not navigating
          return;
        }

        // Otherwise navigate to the path (username or other)
        navigate(`/${decodedParam}`, { replace: true });
      }
    } catch (e) {
      console.error("Failed to read start_param", e);
    }
  }, [navigate, location.pathname]);

  // Handle /t.me/ URLs (direct browser access)
  useEffect(() => {
    const path = location.pathname;
    console.log("App: checking deep link path:", path);

    if (path.startsWith("/t.me/")) {
      const param = decodeURIComponent(path.replace("/t.me/", ""));
      if (!param) return;

      console.log("Handling /t.me/ path with param:", param);

      // Check if it's a partner code (starts with "ref-")
      if (param.startsWith("ref-")) {
        const partnerCode = param.replace("ref-", "");
        console.log("Partner code detected from /t.me/ path:", partnerCode);

        // Store the partner code for use during login
        setDeepLinkPartnerCode(partnerCode);

        // Navigate to welcome page (root) so user can login with partner code
        navigate("/", { replace: true });
        return;
      }

      // Otherwise, it's a username - handle as public profile
      try {
        console.log("Checking for Telegram WebApp to navigate internally");
        if (window.Telegram && window.Telegram.WebApp) {
          navigate(`/${param}`);
          return;
        }
      } catch (e) {
        console.debug("Telegram WebApp check failed", e);
      }

      try {
        console.log("Redirecting to Telegram deep link");
        window.location.href = `https://t.me/AddmyCo_bot/app?startapp=${encodeURIComponent(
          param,
        )}`;
      } catch (e) {
        console.error("Failed to redirect to Telegram deep link", e);
      }
    }
  }, [location.pathname, navigate]);

  const isPublicPath = (() => {
    const path = location.pathname || "/";
    const segments = path.split("/").filter(Boolean);

    console.log("Checking isPublicPath for:", path, "segments:", segments);

    if (segments.length === 0) return false;
    const first = segments[0];

    const reserved = new Set([
      "profile",
      "update-profile",
      "notifications",
      "sub-company",
      "chamber",
      "create-chamber",
      "search",
      "my-qr",
      "create-profile",
      "create-company",
      "theme",
      "membership",
      "enterprise",
      "operator-dashboard",
      "payment-history",
      "background",
      "advertisements",
      "assets",
      "favicon.ico",
      "t.me", // Add this to reserved so /t.me/ paths aren't treated as public profiles
      "",
    ]);

    if (reserved.has(first)) return false;

    // Check if it's a partner code path
    if (first.startsWith("ref-")) {
      console.log("Detected ref- path, not treating as public");
      return false;
    }

    if (segments.length === 1) return true;
    if (
      segments.length === 2 &&
      (segments[1] === "company" || segments[1] === "chamber")
    )
      return true;
    return false;
  })();

  useEffect(() => {
    const savedBgColor = localStorage.getItem("app-background-color");
    const savedFontColor = localStorage.getItem("app-font-color");

    if (savedBgColor) {
      document.documentElement.style.setProperty(
        "--app-background-color",
        savedBgColor,
      );
    }
    if (savedFontColor) {
      document.documentElement.style.setProperty(
        "--app-font-color",
        savedFontColor,
      );
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setProfile(null);
          setProfileLoading(false);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = res.data.data || null;
        setProfile(profileData);
        // Save profile to Zustand store so Footer and other components can access it immediately
        if (profileData) {
          useProfileStore.getState().setProfile(profileData);
        }
        try {
          const username =
            profileData?.username ||
            profileData?.telegram_username ||
            profileData?.telegramUsername;
          if (username) await fetchBackgroundByUsername(username);
        } catch (err) {
          console.debug("fetchBackgroundByUsername after profile failed", err);
        }
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    const onBackgroundUpdated = () => {
      fetchProfile();
    };

    window.addEventListener("background-updated", onBackgroundUpdated);
    fetchProfile();

    return () => {
      window.removeEventListener("background-updated", onBackgroundUpdated);
    };
  }, []);

  useEffect(() => {
    const onProfileUpdated = (e: any) => {
      try {
        const data = e?.detail;
        if (data) setProfile(data);
      } catch (err) {
        console.warn("onProfileUpdated handler failed", err);
      }
    };
    window.addEventListener(
      "profile-updated",
      onProfileUpdated as EventListener,
    );
    return () =>
      window.removeEventListener(
        "profile-updated",
        onProfileUpdated as EventListener,
      );
  }, []);

  const handleJoinChannel = () => {
    setShowWelcomePopup(false);
    try {
      window.open("https://t.me/AddmyCo", "_blank");
    } catch (err) {
      console.error("Failed to open Telegram link:", err);
      window.location.href = "https://t.me/AddmyCo";
    }
  };

  const handleClosePopup = () => {
    setShowWelcomePopup(false);
  };

  const handlePartnerSubmit = (code: string | null) => {
    try {
      if (partnerPopupResolver) partnerPopupResolver(code);
    } finally {
      setShowPartnerPopup(false);
      setPartnerPopupResolver(null);
    }
  };

  const handlePartnerCancel = () => {
    try {
      if (partnerPopupResolver) partnerPopupResolver(null);
    } finally {
      setShowPartnerPopup(false);
      setPartnerPopupResolver(null);
    }
  };

  const handleLogin = async (fromWelcome?: boolean) => {
    try {
      let shownFreePopup = false;
      try {
        await WebApp.ready();
      } catch (e) {
        console.debug("WebApp.ready() failed or not available", e);
      }

      let deepLinkPath: string | null = null;
      try {
        const startParam = WebApp.initDataUnsafe?.start_param;
        if (startParam) {
          const decodedParam = decodeURIComponent(startParam);
          // Don't set deepLinkPath if it's a partner code
          if (!decodedParam.startsWith("ref-")) {
            deepLinkPath = `/${decodedParam}`;
            console.log("Deep link path for navigation:", deepLinkPath);
          }
        }
      } catch (e) {
        console.debug("Failed to read start_param", e);
      }

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
      console.debug(
        "Telegram init user:",
        user,
        "initData:",
        WebApp.initData,
        "initDataUnsafe:",
        WebApp.initDataUnsafe,
      );
      let username = user?.username;
      if (!username) {
        try {
          const promptName = window.prompt(
            "Telegram username not available. Enter a test username to continue (cancel to abort):",
          );
          if (!promptName) {
            try {
              WebApp.showAlert("No Telegram username available.");
            } catch {}
            return;
          }
          username = promptName;
        } catch {
          try {
            WebApp.showAlert("No Telegram username available.");
          } catch {}
          return;
        }
      }

      // Check if we have a deep link partner code from the URL
      let pendingPartnerCode: string | null = deepLinkPartnerCode;

      // If a deep link partner code is present, use it; otherwise skip the prompt.
      if (pendingPartnerCode) {
        console.log("Using deep link partner code:", pendingPartnerCode);
        // Clear the deep link partner code after using it
        setDeepLinkPartnerCode(null);
      }

      let country = "";
      let countryCode = "";
      try {
        if (navigator.onLine) {
          const countryResponse = await axios.get("https://ipapi.co/json/");
          country = countryResponse?.data?.country_name || "";
          countryCode = countryResponse?.data?.country_code || "";
        }
      } catch {}
      if (!API_BASE_URL) {
        WebApp.showAlert("Configuration error: API_BASE_URL not set.");
        return;
      }
      const payload: any = {
        telegram_username: username,
        country: country || "India",
        countryCode: countryCode || "IN",
      };
      if (pendingPartnerCode) {
        payload.partnercode = pendingPartnerCode;
        console.log("Sending partner code in payload:", pendingPartnerCode);
      }
      const response = await axios.post(
        `${API_BASE_URL}/telegram-login`,
        payload,
      );
      const { data } = response;
      if (data && data.success) {
        localStorage.setItem("token", data.data.token);

        if (data.message) {
          if (
            data.message.includes(
              "Welcome! You have been rewarded free premium membership for 1 year.",
            )
          ) {
            try {
              WebApp.showPopup({
                title: "Congratulations!",
                message:
                  "Welcome! You have been rewarded free premium membership for 1 year.",
                buttons: [{ type: "ok" }],
              });
            } catch {}
          } else if (
            data.message.includes(
              "Welcome! You have been registered as a free user.",
            )
          ) {
            setShowWelcomePopup(true);
            shownFreePopup = true;
          }
        }

        const hasProfile =
          data.data.owner_name_english &&
          data.data.owner_name_chinese &&
          typeof data.data.owner_name_english === "string" &&
          typeof data.data.owner_name_chinese === "string" &&
          data.data.owner_name_english.trim().length > 0 &&
          data.data.owner_name_chinese.trim().length > 0;

        if (!hasProfile) {
          setShowWelcome(false);
          setProfileLoading(false);
          navigate("/create-profile");
          return;
        }

        try {
          const res = await axios.get(`${API_BASE_URL}/getProfile`, {
            headers: { Authorization: `Bearer ${data.data.token}` },
          });
          const profileData = res.data.data;
          setProfile(profileData || null);
          try {
            const username =
              profileData?.username ||
              profileData?.telegram_username ||
              profileData?.telegramUsername;
            if (username) await fetchBackgroundByUsername(username);
          } catch (err) {
            console.debug("fetchBackgroundByUsername after login failed", err);
          }

          try {
            const isPremium = profileData?.membertype === "premium";
            if (fromWelcome && !shownFreePopup && !isPremium) {
              setShowWelcomePopup(true);
            }
          } catch (err) {
            console.debug("free-user welcome popup check failed", err);
          }

          const hasCompany =
            profileData &&
            profileData.companydata &&
            profileData.companydata.company_name_english &&
            profileData.companydata.company_name_chinese;

          setShowWelcome(false);
          setProfileLoading(false);

          if (
            deepLinkPath &&
            deepLinkPath !== "/start" &&
            deepLinkPath !== "/"
          ) {
            console.log("Navigating to deep link:", deepLinkPath);
            navigate(deepLinkPath);
          } else if (hasCompany) {
            navigate("/");
          } else {
            console.log(
              "App: navigating to /create-company after getProfile (profile exists but no company)",
            );
            navigate("/create-company");
          }
        } catch {
          setProfile(null);
          setShowWelcome(false);
          setProfileLoading(false);
          console.log(
            "App: navigating to /create-company due to getProfile failure",
          );
          navigate("/create-company");
        }
      } else {
        WebApp.showAlert("Login failed. Please try again.");
      }
    } catch (err) {
      const e: any = err;
      // If backend returned 422 for partner credits, show a helpful message
      if (
        e &&
        e.response &&
        e.response.status === 422 &&
        typeof e.response.data?.message === "string" &&
        e.response.data.message.includes(
          "Partner has no remaining user credits",
        )
      ) {
        // Show a friendly popup when partner has no credits
        try {
          WebApp.showPopup(
            {
              title: "Partner Code Error",
              message:
                "The referal link of this partner is inactive kindly contact your partner and try again",
              buttons: [{ type: "ok", id: "ok" }],
            },
            () => {
              try {
                WebApp.close();
              } catch (_) {}
            },
          );
        } catch (popupErr) {
          // Fallback to alert if popup fails
          try {
            WebApp.showAlert(
              "The referal link of this partner is inactive kindly contact your partner and try again",
            );
          } catch (_) {}
        }
        return;
      }

      WebApp.showAlert("Login failed. Please try again.");
    }
  };

  console.log("Rendering with:", {
    isPublicPath,
    showWelcome,
    profileLoading,
    hasProfile: !!profile,
    deepLinkPartnerCode,
  });

  return (
    <>
      {isPublicPath ? (
        <Routes>
          <Route path="/:username" element={<PublicProfileContainer />} />
          <Route path="/:username/:view" element={<PublicProfileContainer />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      ) : isOperatorSession ? (
        <Routes>
          <Route
            path="/operator-dashboard"
            element={<OperatorDashboardPage />}
          />
          <Route path="*" element={<OperatorDashboardPage />} />
        </Routes>
      ) : showWelcome ? (
        <WelcomePage onLogin={handleLogin} partnerCode={deepLinkPartnerCode} />
      ) : profileLoading ? (
        <div>Loading...</div>
      ) : !profile ? (
        (() => {
          const path = location.pathname || "/";
          if (path === "/create-company" || path === "/create-profile") {
            return (
              <Routes>
                <Route path="/create-company" element={<CreateCompanyPage />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="*" element={<CreateProfile />} />
              </Routes>
            );
          }
          return <CreateProfile />;
        })()
      ) : (
        <Routes>
          <Route path="/:username" element={<PublicProfileContainer />} />
          <Route path="/:username/:view" element={<PublicProfileContainer />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/update-profile" element={<UpdateProfilePage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sub-company" element={<SubCompanyPage />} />
          <Route path="/chamber" element={<ChamberPage />} />
          <Route path="/create-chamber" element={<CreateChamberPage />} />
          <Route path="/search" element={<ContactPage />} />
          <Route path="/my-qr" element={<MyQRPage />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-company" element={<CreateCompanyPage />} />
          <Route path="/theme" element={<ThemePage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/advertisements" element={<AdvertisementPage />} />
          <Route
            path="/advertisements/faq"
            element={<AdvertisementFAQPage />}
          />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/background" element={<BackgroundPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      )}
      {showWelcomePopup && (
        <WelcomePopup
          title="Welcome to AddMyCo!"
          message="You have been logged in Successfully&#10;&#10;Subscribe and Contact @DynamicNameCard to get one year premium membership absolutely Free"
          onClose={handleClosePopup}
          onJoinChannel={handleJoinChannel}
        />
      )}
      {showPartnerPopup && (
        <PartnerCodePopup
          open={showPartnerPopup}
          onClose={handlePartnerCancel}
          onSubmit={handlePartnerSubmit}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BottomCircleAdProvider>
        <AppRoutes />
      </BottomCircleAdProvider>
    </BrowserRouter>
  );
}

export default App;
