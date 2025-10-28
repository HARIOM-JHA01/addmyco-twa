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
import PublicProfileContainer from "./pages/PublicProfileContainer";
import { fetchBackgroundByUsername as fetchBgByUsername } from "./utils/theme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // use shared theme helper to fetch/apply background by username
  const fetchBackgroundByUsername = fetchBgByUsername;

  useEffect(() => {
    try {
      const startParam = WebApp.initDataUnsafe?.start_param;
      const hasToken = !!localStorage.getItem("token");
      const path = location.pathname || "/";

      // Only auto-navigate to deep-linked public profile when user is not authenticated
      // and we're effectively at the app root. Prevents bouncing back to public profile
      // after login when navigating to /profile or other private routes.
      const atAppRoot = path === "/" || path === "/start" || path === "";
      const alreadyHandled =
        sessionStorage.getItem("start_param_handled") === "1";

      if (startParam && !hasToken && atAppRoot && !alreadyHandled) {
        sessionStorage.setItem("start_param_handled", "1");
        navigate(`/${startParam}`, { replace: true });
      }
    } catch (e) {
      console.error("Failed to read start_param", e);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/t.me/")) {
      const userId = decodeURIComponent(path.replace("/t.me/", ""));
      if (!userId) return;
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          navigate(`/${userId}`);
          return;
        }
      } catch (e) {
        console.debug("Telegram WebApp check failed", e);
      }
      try {
        window.location.href = `https://t.me/AddmyCo_bot/app?startapp=${encodeURIComponent(
          userId
        )}`;
      } catch (e) {
        console.error("Failed to redirect to Telegram deep link", e);
      }
    }
  }, [location.pathname, navigate]);

  const isPublicPath = (() => {
    const path = location.pathname || "/";
    const segments = path.split("/").filter(Boolean);
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
      "payment-history",
      "background",
      "assets",
      "favicon.ico",
      "",
    ]);
    if (reserved.has(first)) return false;
    if (segments.length === 1) return true;
    if (
      segments.length === 2 &&
      (segments[1] === "company" || segments[1] === "chamber")
    )
      return true;
    return false;
  })();

  useEffect(() => {
    // apply any saved values immediately so UI doesn't flash
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
        // after we have a username, attempt to fetch user-specific background
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
      // refresh profile & user background when background-updated event triggers
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
      onProfileUpdated as EventListener
    );
    return () =>
      window.removeEventListener(
        "profile-updated",
        onProfileUpdated as EventListener
      );
  }, []);

  // fromWelcome: when true indicates login was triggered from WelcomePage
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
          deepLinkPath = `/${decodeURIComponent(startParam)}`;
          console.log("Deep link detected:", deepLinkPath);
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
        WebApp.initDataUnsafe
      );
      let username = user?.username;
      if (!username) {
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
              const popupOptions = {
                title: "Welcome to AddMyCo!",
                message:
                  "You have been logged in Successfully\n\nSubscribe and Contact @DynamicNameCard to get one year premium membership absolutely Free",
                buttons: [
                  { type: "close", text: "Close" },
                  { type: "default", text: "Join Channel to Get Rewards" },
                ],
              };

              let handled = false;
              try {
                const maybeResult = WebApp.showPopup?.(popupOptions as any);
                const mp: any = maybeResult;

                const processResult = (result: any) => {
                  const selectedText =
                    (result && result.button && result.button.text) ||
                    result?.text ||
                    result;
                  if (typeof selectedText === "string") {
                    if (
                      selectedText.includes("Join Channel") ||
                      selectedText.includes("Join")
                    ) {
                      try {
                        WebApp.openLink("https://t.me/AddmyCo");
                      } catch (err) {
                        console.error("Failed to open Telegram link:", err);
                      }
                    }
                  }
                };

                if (mp && typeof mp.then === "function") {
                  mp.then((result: any) => processResult(result)).catch(
                    () => {}
                  );
                  handled = true;
                } else if (mp !== undefined) {
                  // handle synchronous return value
                  try {
                    processResult(mp);
                    handled = true;
                  } catch (err) {
                    // continue to fallback
                    console.debug(
                      "showPopup sync result processing failed",
                      err
                    );
                    handled = false;
                  }
                }
              } catch (e) {
                handled = false;
              }

              if (!handled) {
                try {
                  WebApp.showAlert(popupOptions.message);
                } catch (err) {
                  console.error("Failed to show alert:", err);
                }
              }
              // mark that we've shown the free-user popup so we don't duplicate
              // it later after we fetch profile
              shownFreePopup = true;
            } catch {}
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

          // New requirement: if this login was initiated from the Welcome
          // page, show the free-user signup popup for free users every time
          // they login via the WelcomePage. Avoid showing duplicate popup if
          // it was already shown above (e.g., on first-time registration).
          try {
            const isPremium = profileData?.membertype === "premium";
            if (fromWelcome && !shownFreePopup && !isPremium) {
              const popupOptions = {
                title: "Welcome to AddMyCo!",
                message:
                  "You have been logged in Successfully\n\nSubscribe and Contact @DynamicNameCard to get one year premium membership absolutely Free",
                buttons: [
                  { type: "close", text: "Close" },
                  { type: "default", text: "Join Channel to Get Rewards" },
                ],
              };

              let handled2 = false;
              try {
                const maybeResult = WebApp.showPopup?.(popupOptions as any);
                const mp: any = maybeResult;

                const processResult = (result: any) => {
                  const selectedText =
                    (result && result.button && result.button.text) ||
                    result?.text ||
                    result;
                  if (typeof selectedText === "string") {
                    if (
                      selectedText.includes("Join Channel") ||
                      selectedText.includes("Join")
                    ) {
                      try {
                        WebApp.openLink("https://t.me/AddmyCo");
                      } catch (err) {
                        console.error("Failed to open Telegram link:", err);
                      }
                    }
                  }
                };

                if (mp && typeof mp.then === "function") {
                  mp.then((result: any) => processResult(result)).catch(
                    () => {}
                  );
                  handled2 = true;
                } else if (mp !== undefined) {
                  try {
                    processResult(mp);
                    handled2 = true;
                  } catch (err) {
                    console.debug(
                      "showPopup sync result processing failed",
                      err
                    );
                    handled2 = false;
                  }
                }
              } catch (e) {
                handled2 = false;
              }

              if (!handled2) {
                try {
                  WebApp.showAlert(popupOptions.message);
                } catch (err) {
                  console.error("Failed to show alert:", err);
                }
              }
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
              "App: navigating to /create-company after getProfile (profile exists but no company)"
            );
            navigate("/create-company");
          }
        } catch {
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

  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/:username" element={<PublicProfileContainer />} />
        <Route path="/:username/:view" element={<PublicProfileContainer />} />
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
