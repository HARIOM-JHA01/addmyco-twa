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
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import CreateCompanyPage from "./pages/CreateCompanyPage";
import BackgroundPage from "./pages/BackgroundPage";
import HomePage from "./pages/HomePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicCompanyPage from "./pages/PublicCompanyPage";
import PublicChamberPage from "./pages/PublicChamberPage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  // Always show Welcome page on startup to display banners
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Check if this is a public path EARLY to bypass welcome page
  const isPublicPath = (() => {
    const path = location.pathname || "/";
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return false;
    const first = segments[0];
    // reserved app routes that should NOT be treated as username
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
      "payment-history",
      "background",
      "assets",
      "favicon.ico",
      "",
    ]);
    if (reserved.has(first)) return false;
    // /:username
    if (segments.length === 1) return true;
    // /:username/company or /:username/chamber
    if (
      segments.length === 2 &&
      (segments[1] === "company" || segments[1] === "chamber")
    )
      return true;
    return false;
  })();

  useEffect(() => {
    // Fetch profile/company data on mount
    // Also fetch global background/theme settings and apply CSS variables.

    // Apply saved colors from localStorage immediately (before API call)
    const savedBgColor = localStorage.getItem("app-background-color");
    const savedFontColor = localStorage.getItem("app-font-color");

    if (savedBgColor) {
      document.documentElement.style.setProperty(
        "--app-background-color",
        savedBgColor
      );
    }
    if (savedFontColor) {
      document.documentElement.style.setProperty(
        "--app-font-color",
        savedFontColor
      );
    }

    const fetchBackground = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await axios.get(`${API_BASE_URL}/getbackground`, {
          headers,
        });
        if (res?.data?.success && res.data.data) {
          const bg = res.data.data;
          // Apply background color
          if (bg.backgroundcolor) {
            document.documentElement.style.setProperty(
              "--app-background-color",
              bg.backgroundcolor
            );
            // Save to localStorage for persistence
            localStorage.setItem("app-background-color", bg.backgroundcolor);
          } else {
            // Try to restore from localStorage
            const savedBgColor = localStorage.getItem("app-background-color");
            if (savedBgColor) {
              document.documentElement.style.setProperty(
                "--app-background-color",
                savedBgColor
              );
            }
          }
          // Apply font color
          if (bg.fontcolor) {
            document.documentElement.style.setProperty(
              "--app-font-color",
              bg.fontcolor
            );
            // Save to localStorage for persistence
            localStorage.setItem("app-font-color", bg.fontcolor);
          } else {
            // Try to restore from localStorage
            const savedFontColor = localStorage.getItem("app-font-color");
            if (savedFontColor) {
              document.documentElement.style.setProperty(
                "--app-font-color",
                savedFontColor
              );
            }
          }
          // Apply background image if available
          if (bg.Thumbnail || bg.thumbnail || bg.backgroundImage) {
            const bgImageUrl =
              bg.Thumbnail || bg.thumbnail || bg.backgroundImage;
            document.documentElement.style.setProperty(
              "--app-background-image",
              `url(${bgImageUrl})`
            );
            // Also apply to body for global background
            document.body.style.backgroundImage = `url(${bgImageUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            document.body.style.backgroundAttachment = "fixed";
          } else {
            // If no background image, use default
            document.documentElement.style.setProperty(
              "--app-background-image",
              "url(/src/assets/background.jpg)"
            );
          }
        } else {
          // No data from API, try to restore from localStorage
          const savedBgColor = localStorage.getItem("app-background-color");
          const savedFontColor = localStorage.getItem("app-font-color");

          if (savedBgColor) {
            document.documentElement.style.setProperty(
              "--app-background-color",
              savedBgColor
            );
          }
          if (savedFontColor) {
            document.documentElement.style.setProperty(
              "--app-font-color",
              savedFontColor
            );
          }

          // Set default background image
          document.documentElement.style.setProperty(
            "--app-background-image",
            "url(/src/assets/background.jpg)"
          );
        }
      } catch (e) {
        // ignore failures, try to restore from localStorage
        console.debug("fetchBackground failed", e);

        const savedBgColor = localStorage.getItem("app-background-color");
        const savedFontColor = localStorage.getItem("app-font-color");

        if (savedBgColor) {
          document.documentElement.style.setProperty(
            "--app-background-color",
            savedBgColor
          );
        }
        if (savedFontColor) {
          document.documentElement.style.setProperty(
            "--app-font-color",
            savedFontColor
          );
        }

        // Set default background image
        document.documentElement.style.setProperty(
          "--app-background-image",
          "url(/src/assets/background.jpg)"
        );
      }
    };

    // Call once at startup
    fetchBackground();

    // Re-fetch when other parts of the app signal an update (ThemePage dispatches this)
    const onBackgroundUpdated = () => fetchBackground();
    window.addEventListener("background-updated", onBackgroundUpdated);
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
        setProfile(res.data.data || null);
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
    // cleanup listener when component unmounts
    return () => {
      window.removeEventListener("background-updated", onBackgroundUpdated);
    };
  }, []);

  // Listen for profile updates from other pages so we can refresh the local state
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
      onProfileUpdated as EventListener
    );
    return () =>
      window.removeEventListener(
        "profile-updated",
        onProfileUpdated as EventListener
      );
  }, []);

  const handleLogin = async () => {
    try {
      // Ensure WebApp is ready before accessing init data
      try {
        await WebApp.ready();
      } catch (e) {
        console.debug("WebApp.ready() failed or not available", e);
      }

      // initData may be available on different properties depending on SDK initialization
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
        WebApp.initDataUnsafe
      );
      let username = user?.username;
      if (!username) {
        // If running outside Telegram or no username available, allow a manual prompt (dev/test)
        try {
          const promptName = window.prompt(
            "Telegram username not available. Enter a test username to continue (cancel to abort):"
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
      const response = await axios.post(`${API_BASE_URL}/telegram-login`, {
        telegram_username: username,
        country: country || "India",
        countryCode: countryCode || "IN",
      });
      const { data } = response;
      if (data && data.success) {
        localStorage.setItem("token", data.data.token);

        // Show welcome message based on API response
        if (data.message) {
          if (
            data.message.includes(
              "Welcome! You have been rewarded free premium membership for 1 year."
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
              "Welcome! You have been registered as a free user."
            )
          ) {
            try {
              // Prefer a popup with a dedicated button for the channel; fall back to alert
              const popupOptions = {
                title: "Signed up",
                message:
                  "You have been signed up successfully\n\nSubscribe and Contact @DynamicNameCard to get one year premium membership absolutely Free",
                // include two buttons: OK and a channel button labelled with the handle
                buttons: [
                  { type: "close", text: "Close" },
                  { type: "default", text: "Join DynamicNameCard" },
                ],
              };

              let handled = false;
              try {
                const maybePromise = WebApp.showPopup?.(popupOptions as any);
                // If showPopup returns a promise-like value, handle the result
                const mp: any = maybePromise;
                if (mp && typeof mp.then === "function") {
                  mp.then((result: any) => {
                    // Result shape depends on SDK version; try to detect selected button text
                    const selectedText =
                      (result && result.button && result.button.text) ||
                      result?.text ||
                      result;
                    if (
                      typeof selectedText === "string" &&
                      selectedText.includes("@DynamicNameCard")
                    ) {
                      try {
                        WebApp.openTelegramLink("https://t.me/DynamicNameCard");
                      } catch (err) {
                        console.error("Failed to open Telegram link:", err);
                      }
                    }
                  }).catch(() => {});
                  handled = true;
                }
              } catch (e) {
                // ignore and fall back to alert
                handled = false;
              }

              if (!handled) {
                try {
                  WebApp.showAlert(popupOptions.message);
                } catch (err) {
                  console.error("Failed to show alert:", err);
                }
              }
            } catch {}
          }
        }

        // Check if profile exists by looking for owner_name_english and owner_name_chinese
        // Ensure they are non-empty strings (trim to avoid whitespace-only values)
        const hasProfile =
          data.data.owner_name_english &&
          data.data.owner_name_chinese &&
          typeof data.data.owner_name_english === "string" &&
          typeof data.data.owner_name_chinese === "string" &&
          data.data.owner_name_english.trim().length > 0 &&
          data.data.owner_name_chinese.trim().length > 0;

        if (!hasProfile) {
          // No profile exists, go to create profile page
          setShowWelcome(false);
          setProfileLoading(false);
          navigate("/create-profile");
          return;
        }

        // Profile exists, now check for company
        // Call getProfile API to check company data
        try {
          const res = await axios.get(`${API_BASE_URL}/getProfile`, {
            headers: { Authorization: `Bearer ${data.data.token}` },
          });
          const profileData = res.data.data;
          setProfile(profileData || null);

          // Check if company exists by looking for company_name_english and company_name_chinese in companydata
          const hasCompany =
            profileData &&
            profileData.companydata &&
            profileData.companydata.company_name_english &&
            profileData.companydata.company_name_chinese;

          setShowWelcome(false);
          setProfileLoading(false);

          if (hasCompany) {
            // Both profile and company exist, go to home page
            navigate("/");
          } else {
            // Profile exists but no company, go to create company page
            console.log(
              "App: navigating to /create-company after getProfile (profile exists but no company)"
            );
            navigate("/create-company");
          }
        } catch {
          // If getProfile fails, assume no company and go to create company
          setProfile(null);
          setShowWelcome(false);
          setProfileLoading(false);
          console.log(
            "App: navigating to /create-company due to getProfile failure"
          );
          navigate("/create-company");
        }
      } else {
        WebApp.showAlert("Login failed. Please try again.");
      }
    } catch (err) {
      WebApp.showAlert("Login failed. Please try again.");
    }
  };

  // If this looks like a public deep-link (/:username or /:username/company or /:username/chamber)
  // bypass the welcome/auth gating and render public routes directly so the app works when
  // someone opens https://addmy.co/username from outside (Telegram, browser refresh, etc.).
  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/:username" element={<PublicProfilePage />} />
        <Route path="/:username/company" element={<PublicCompanyPage />} />
        <Route path="/:username/chamber" element={<PublicChamberPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    );
  }

  if (showWelcome) {
    return <WelcomePage onLogin={handleLogin} />;
  }

  if (profileLoading) {
    return <div>Loading...</div>;
  }

  // If no profile/company data, allow create-profile and create-company routes to render.
  if (!profile) {
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
  }

  return (
    <Routes>
      {/* Public routes - accessible without authentication */}
      <Route path="/:username" element={<PublicProfilePage />} />
      <Route path="/:username/company" element={<PublicCompanyPage />} />
      <Route path="/:username/chamber" element={<PublicChamberPage />} />

      {/* Authenticated routes */}
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
      <Route path="/payment-history" element={<PaymentHistoryPage />} />
      <Route path="/background" element={<BackgroundPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
