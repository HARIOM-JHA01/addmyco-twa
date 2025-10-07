import { useState } from "react";
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
import axios from "axios";
import WebApp from "@twa-dev/sdk";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(() => {
    // Only show welcome if no token is present
    return !localStorage.getItem("token");
  });

  const handleLogin = async () => {
    WebApp.ready();
    try {
      const user = WebApp.initDataUnsafe.user;
      if (!user || !user.username) {
        WebApp.showAlert("No Telegram username available.");
        return;
      }
      let country = "";
      try {
        if (navigator.onLine) {
          const countryResponse = await axios.get("https://ipapi.co/json/");
          country = countryResponse?.data?.country_name || "";
        }
      } catch {}
      if (!API_BASE_URL) {
        WebApp.showAlert("Configuration error: API_BASE_URL not set.");
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/telegram-login`, {
        telegram_username: user.username,
        country: country || "India",
      });
      const { data } = response;
      if (data && data.success) {
        localStorage.setItem("token", data.data.token);
        setShowWelcome(false);
        if (data.message && data.message.includes("Welcome")) {
          try {
            WebApp.showPopup({
              title: "Congratulations!",
              message: data.message,
              buttons: [{ type: "ok" }],
            });
          } catch {}
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
