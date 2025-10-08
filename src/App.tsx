import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import SubCompanyPage from "./pages/SubCompany";
import ChamberPage from "./pages/ChamberPage";
import ContactPage from "./pages/ContactPage";
import MyQRPage from "./pages/MyQRPage";
import CreateProfile from "./pages/createProfile";
import ThemePage from "./pages/ThemePage";
import WelcomePage from "./pages/WelcomePage";
import MembershipPage from "./pages/MembershipPage";
import axios from "axios";
import WebApp from "@twa-dev/sdk";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  // Always show Welcome page on startup, but only show free membership message once
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true); // Always true on startup
  const [showFreeMembership, setShowFreeMembership] = useState(() => {
    return !localStorage.getItem("freeMembershipShown");
  });
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Fetch profile/company data on mount
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
  }, []);

  const handleLogin = async () => {
    WebApp.ready();
    try {
      const user = WebApp.initDataUnsafe.user;
      if (!user || !user.username) {
        WebApp.showAlert("No Telegram username available.");
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
      } catch {}
      if (!API_BASE_URL) {
        WebApp.showAlert("Configuration error: API_BASE_URL not set.");
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/telegram-login`, {
        telegram_username: user.username,
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
          setProfile(res.data.data || null);
        } catch {
          setProfile(null);
        }
        // If no profile/company data, go to create profile
        if (!profile) {
          navigate("/create-profile");
        } else {
          navigate("/profile");
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
      <Route path="/" element={<ProfilePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/update-profile" element={<UpdateProfilePage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/sub-company" element={<SubCompanyPage />} />
      <Route path="/chamber" element={<ChamberPage />} />
      <Route path="/search" element={<ContactPage />} />
      <Route path="/my-qr" element={<MyQRPage />} />
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/theme" element={<ThemePage />} />
      <Route path="/membership" element={<MembershipPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename="/addmyco">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
