import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

interface WelcomePageProps {
  onLogin: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      setBannerLoading(true);
      setBannerError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/banner`);
        setBanners(res.data.data || []);
      } catch (err: any) {
        setBannerError("Failed to load banners");
      } finally {
        setBannerLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    if (carouselInterval.current) clearInterval(carouselInterval.current);
    carouselInterval.current = setInterval(() => {
      setCurrentBanner((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * banners.length);
        } while (banners.length > 1 && next === prev);
        return next;
      });
    }, 3000);
    return () => {
      if (carouselInterval.current) clearInterval(carouselInterval.current);
    };
  }, [banners]);

  useEffect(() => {
    // Remove token on every startup
    localStorage.removeItem("token");
  }, []);

  // Wrap onLogin to show loader
  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await onLogin();
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[url(/src/assets/background.jpg)] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header hideNotification={true} />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div
            className="bg-opacity-90 rounded-lg p-8 shadow-lg flex flex-col items-center w-[368px]"
            style={{ backgroundColor: "var(--app-background-color)" }}
          >
            <h1 className="text-3xl font-space-bold mb-6 text-white">
              Welcome to AddMy
            </h1>
            <button
              className="px-6 py-3 bg-gray-500 text-white text-2xl rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center min-w-[180px]"
              onClick={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <span className="flex items-center gap-2 font-space-bold">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Get in to the app"
              )}
            </button>
          </div>
        </main>
        <div className="w-full flex flex-col items-center mt-6">
          {bannerLoading && (
            <div className="text-gray-500">Loading banners...</div>
          )}
          {bannerError && <div className="text-red-500">{bannerError}</div>}
          {banners.length > 0 && (
            <div
              className="relative w-full flex flex-col items-center"
              style={{ minHeight: 140 }}
            >
              <div className="w-full flex justify-center items-center">
                {banners.map((banner, idx) => (
                  <a
                    key={banner._id}
                    href={
                      banner.Link.startsWith("http")
                        ? banner.Link
                        : `https://${banner.Link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute transition-all duration-700 ease-in-out ${
                      idx === currentBanner
                        ? "opacity-100 scale-100 z-10"
                        : "opacity-0 scale-95 z-0"
                    } w-full flex flex-col items-center`}
                    style={{
                      pointerEvents: idx === currentBanner ? "auto" : "none",
                    }}
                  >
                    <img
                      src={banner.Banner}
                      alt={banner.Title}
                      className="rounded-lg shadow-lg w-[368px] h-[125px] object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <footer className="bg-gray-100 text-gray-500 text-center py-3 text-sm">
          &copy; {new Date().getFullYear()} AddMy. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
