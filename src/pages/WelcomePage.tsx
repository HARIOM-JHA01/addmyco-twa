import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import axios from "axios";
import backgroundImg from "../assets/background.jpg";
import WebApp from "@twa-dev/sdk";

interface WelcomePageProps {
  onLogin: (fromWelcome?: boolean) => void | Promise<void>;
  partnerCode?: string | null;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin, partnerCode }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(true);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      WebApp.ready();
      const hasValidTelegramData = !!(
        WebApp.initDataUnsafe?.user ||
        (WebApp.initData &&
          typeof WebApp.initData === "object" &&
          (WebApp.initData as any).user)
      );
      setIsInTelegram(hasValidTelegramData);
    } catch (e) {
      setIsInTelegram(false);
    }
  }, []);

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
  }, [API_BASE_URL]);

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
    localStorage.removeItem("token");
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await onLogin(true);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `var(--app-background-image, url(${backgroundImg}))`,
      }}
    >
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header hideNotification={true} />
        <main className="flex-1 flex flex-col items-center justify-start mt-6">
          <div
            className="relative z-20 rounded-lg p-8 shadow-lg flex flex-col items-center w-[368px]"
            style={{ backgroundColor: "rgba(0,153,204,0.75)" }}
          >
            <h1 className="text-2xl font-space-bold mb-6 text-white text-center">
              Dynamic Namecard.. Connecting World !!
            </h1>

            {partnerCode && (
              <div className="mb-4 px-4 py-2 bg-green-500/80 rounded-lg">
                <p className="text-white text-sm text-center">
                  Partner Code: <span className="font-bold">{partnerCode}</span>
                </p>
                <p className="text-white text-xs text-center mt-1">
                  This code will be applied when you sign up
                </p>
              </div>
            )}

            {!isInTelegram ? (
              <div className="text-center">
                <p className="text-white mb-4">
                  This app must be opened inside Telegram.
                </p>
              </div>
            ) : (
              <button
                className="px-6 py-3 bg-green-600 text-white text-2xl rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center min-w-[180px]"
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
                  "Get in to Smart MiniApp"
                )}
              </button>
            )}
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
              style={{ minHeight: 380 }}
            >
              <div className="w-full flex justify-center items-center">
                {banners[currentBanner] && (
                  <a
                    key={banners[currentBanner]._id}
                    href={
                      banners[currentBanner].Link.startsWith("http")
                        ? banners[currentBanner].Link
                        : `https://${banners[currentBanner].Link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-700 ease-in-out w-full flex flex-col items-center"
                  >
                    <img
                      src={banners[currentBanner].Banner}
                      alt={banners[currentBanner].Title}
                      className="rounded-lg shadow-lg w-60 h-60 object-cover"
                    />
                  </a>
                )}
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
