import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import CreateCompanyPage from "./pages/CreateCompanyPage";
import BackgroundPage from "./pages/BackgroundPage";
import HomePage from "./pages/HomePage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  // Always show Welcome page on startup to display banners
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFreeMembership, setShowFreeMembership] = useState(() => {
    return !localStorage.getItem("freeMembershipShown");
  });
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Fetch profile/company data on mount
    // Also fetch global background/theme settings and apply CSS variables.
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
          if (bg.backgroundcolor) {
            document.documentElement.style.setProperty(
              "--app-background-color",
              bg.backgroundcolor
            );
          }
          if (bg.fontcolor) {
            document.documentElement.style.setProperty(
              "--app-font-color",
              bg.fontcolor
            );
          }
        }
      } catch (e) {
        // ignore failures, keep default theme
        console.debug("fetchBackground failed", e);
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
        setShowWelcome(false);
        if (showFreeMembership) {
          localStorage.setItem("freeMembershipShown", "1");
          setShowFreeMembership(false);
          if (data.message && data.message.includes("Welcome")) {
            try {
              WebApp.showPopup({
                title: "Congratulations!",
                message: data.message,
                buttons: [{ type: "ok" }],
              });
            } catch {}
          }
        }
        // After login, fetch profile again
        try {
          const res = await axios.get(`${API_BASE_URL}/getProfile`, {
            headers: { Authorization: `Bearer ${data.data.token}` },
          });
          const profileData = res.data.data;
          setProfile(profileData || null);

          const hasProfile = profileData && profileData.owner_name_english;
          const hasCompany =
            profileData &&
            (profileData.companydata ||
              profileData.company ||
              profileData.company_profile);

          // Hide welcome page and navigate based on profile/company status
          setShowWelcome(false);
          setProfileLoading(false);

          if (hasProfile && hasCompany) {
            navigate("/");
          } else if (hasProfile && !hasCompany) {
            navigate("/create-company");
          } else {
            navigate("/create-profile");
          }
        } catch {
          setProfile(null);
          setShowWelcome(false);
          setProfileLoading(false);
          navigate("/create-profile");
        }
      } else {
        WebApp.showAlert("Login failed. Please try again.");
      }
    } catch (err) {
      WebApp.showAlert("Login failed. Please try again.");
    }
  };

  if (showWelcome) {
    return <WelcomePage onLogin={handleLogin} />;
  }

  if (profileLoading) {
    return <div>Loading...</div>;
  }

  // If no profile/company data, show create profile page
  if (!profile) {
    return <CreateProfile />;
  }

  return (
    <Routes>
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
      <Route path="/background" element={<BackgroundPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/addmyco/">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
