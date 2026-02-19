import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import backgroundImg from "../assets/background.jpg";
import WebApp from "@twa-dev/sdk";
import {
  fetchAdvertisements,
  trackAdDisplay,
  trackAdClick,
} from "../services/advertisementService";

interface WelcomePageProps {
  onLogin: (fromWelcome?: boolean) => void | Promise<void>;
  partnerCode?: string | null;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin, partnerCode }) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(true);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [_, setButtonWidth] = useState<number | null>(null);

  // Operator login modal state (welcome page)
  const [operatorLoginOpen, setOperatorLoginOpen] = useState(false);
  const [operatorLoginUsername, setOperatorLoginUsername] = useState("");
  const [operatorLoginPassword, setOperatorLoginPassword] = useState("");
  const [operatorLoginLoading, setOperatorLoginLoading] = useState(false);
  const [operatorLoginError, setOperatorLoginError] = useState<string | null>(
    null,
  );

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
        const ads = await fetchAdvertisements();
        setBanners(ads);
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
    // Don't clear token if operator just logged in
    const operatorFlag = localStorage.getItem("operator_logged_in");
    if (operatorFlag !== "true") {
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await onLogin(true);
    } finally {
      setLoginLoading(false);
    }
  };

  // Operator login from Welcome page
  const handleOperatorLoginFromWelcome = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setOperatorLoginLoading(true);
    setOperatorLoginError(null);
    try {
      // lazy-import service to keep top imports minimal
      const { operatorLogin } = await import("../services/enterpriseService");
      await operatorLogin(operatorLoginUsername.trim(), operatorLoginPassword);
      // Set flag to indicate operator login before reload
      localStorage.setItem("operator_logged_in", "true");
      // on success navigate to operator dashboard
      window.location.href = "/operator-dashboard"; // full reload avoids auth timing issues
    } catch (err: any) {
      setOperatorLoginError(err?.message || "Login failed");
      console.error("Operator login (welcome) error:", err);
    } finally {
      setOperatorLoginLoading(false);
    }
  };

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const update = () =>
      setButtonWidth(Math.round(btn.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(btn);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isInTelegram]);

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
                <p className="text-white text-sm text-center mb-1">
                  You are signing up with our partner having reference code :
                </p>
                <p className="text-white text-sm text-center">
                  <span className="font-bold">{partnerCode}</span>
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
              <>
                <button
                  ref={buttonRef}
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
                    "Log in to Smart MiniApp"
                  )}
                </button>

                {/* operator login text button */}
                <button
                  onClick={() => setOperatorLoginOpen(true)}
                  className="mt-3 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                >
                  Enterprise operator login
                </button>

                {/* Enterprise operator login modal (from welcome) */}
                {operatorLoginOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#007cb6] via-[#005f8e] to-[#004570] px-6 py-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            <h3 className="text-xl font-bold">
                              Operator Login
                            </h3>
                          </div>
                          <p className="text-blue-100 text-sm">
                            Access your operator dashboard
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {operatorLoginError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                            <svg
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{operatorLoginError}</span>
                          </div>
                        )}

                        <form
                          onSubmit={handleOperatorLoginFromWelcome}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Username
                            </label>
                            <input
                              type="text"
                              value={operatorLoginUsername}
                              onChange={(e) =>
                                setOperatorLoginUsername(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007cb6] focus:border-transparent transition"
                              placeholder="Enter your username"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Password
                            </label>
                            <input
                              type="password"
                              value={operatorLoginPassword}
                              onChange={(e) =>
                                setOperatorLoginPassword(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007cb6] focus:border-transparent transition"
                              placeholder="Enter your password"
                              required
                            />
                          </div>

                          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                              type="submit"
                              disabled={operatorLoginLoading}
                              className="flex-1 bg-[#007cb6] hover:bg-[#005f8e] text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {operatorLoginLoading ? (
                                <>
                                  <svg
                                    className="animate-spin h-4 w-4"
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
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m14 0V9a2 2 0 00-2-2h-6a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2z"
                                    />
                                  </svg>
                                  Login
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold transition"
                              onClick={() => {
                                setOperatorLoginOpen(false);
                                setOperatorLoginError(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                      (
                        banners[currentBanner].redirectUrl ||
                        banners[currentBanner].Link ||
                        ""
                      ).startsWith("http")
                        ? banners[currentBanner].redirectUrl ||
                          banners[currentBanner].Link
                        : `https://${
                            banners[currentBanner].redirectUrl ||
                            banners[currentBanner].Link
                          }`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-700 ease-in-out w-full flex flex-col items-center"
                    onClick={() => {
                      // Track click event
                      if (banners[currentBanner]._id) {
                        trackAdClick(banners[currentBanner]._id).catch(
                          () => {},
                        );
                      }
                    }}
                  >
                    <img
                      src={
                        banners[currentBanner].imageUrl ||
                        banners[currentBanner].Banner
                      }
                      alt={
                        banners[currentBanner].title ||
                        banners[currentBanner].Title
                      }
                      className="rounded-lg shadow-lg object-cover"
                      style={{
                        width: "300px",
                        height: "300px",
                        maxWidth: "100%",
                        objectFit: "cover",
                      }}
                      onLoad={() => {
                        // Track display/impression event
                        if (banners[currentBanner]._id) {
                          trackAdDisplay(banners[currentBanner]._id).catch(
                            () => {},
                          );
                        }
                      }}
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
