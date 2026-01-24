import { useState, useEffect } from "react";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import Header from "../components/Header";
import Footer from "../components/Footer";
import i18n from "../i18n";
import AdStatisticsPanel from "../components/AdStatisticsPanel";
import { getAdStatistics } from "../services/advertisementService";
import { useProfileStore } from "../store/profileStore";
import { formatDate } from "../utils/date";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Package {
  _id: string;
  name: string;
  description: string;
  displayCredits: number;
  priceUSDT: number;
  positions: string[];
  duration: number | null;
  isActive: boolean;
}

interface Advertisement {
  _id: string;
  title?: string;
  description?: string;
  position: string;
  country: string;
  imageUrl: string;
  targetUrl?: string;
  redirectUrl: string;
  displayCount: number;
  displayUsed: number;
  displayRemaining: number;
  status: string;
  approvalStatus?: string;
  viewCount: number;
  clickCount: number;
  ctrPercentage: number;
  impressions?: number;
  clicks?: number;
  credits?: number;
  createdAt: string;
}

interface CreditBalance {
  _id?: string;
  userId?: string;
  totalCredits: number;
  usedCredits: number;
  balanceCredits: number;
  availableCredits?: number;
}

interface PaymentHistory {
  _id: string;
  user: string;
  package: {
    _id: string;
    name: string;
    displayCredits: number;
    priceUSDT: number;
  };
  transactionId: string;
  walletAddress: string;
  amount: number;
  credits: number;
  status: number;
  approvalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

type TabType =
  | "dashboard"
  | "buy-credits"
  | "create-ad"
  | "my-ads"
  | "payment-history";

export default function AdvertisementPage() {
  const profile = useProfileStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [packages, setPackages] = useState<Package[]>([]);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Buy credits state
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [buyTab, setBuyTab] = useState<"start" | "circle">("start");
  const [createAdTab, setCreateAdTab] = useState<"start" | "circle">("start");
  const [usdtModalOpen, setUsdtModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [usdtModalLoading, setUsdtModalLoading] = useState(false);
  const [usdtModalError, setUsdtModalError] = useState<string | null>(null);

  // Ad action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // My Ads filter state
  const [adStatusFilter, setAdStatusFilter] = useState<
    "all" | "active" | "consumed"
  >("all");

  // Statistics state
  const [statsLoading, setStatsLoading] = useState<string | null>(null);
  const [adStats, setAdStats] = useState<any>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  // Payment History filter state
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Create ad state
  const [createAdLoading, setCreateAdLoading] = useState(false);
  const [createAdError, setCreateAdError] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({
    position: "HOME_BANNER",
    countries: [] as string[],
    credits: 1,
    redirectUrl: "",
    image: null as File | null,
  });
  const [rates, setRates] = useState<{
    HOME_BANNER: number;
    BOTTOM_CIRCLE: number;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublicLink, setIsPublicLink] = useState<boolean>(false);
  const [countrySelection, setCountrySelection] = useState<
    "global" | "country"
  >("country");
  const [countryFilterEnabled, setCountryFilterEnabled] = useState<
    boolean | null
  >(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Validate whether a Telegram URL is a public channel link
  const isTelegramPublicLink = (url: string) => {
    try {
      // Check if URL is valid
      if (!url || !url.trim()) return false;

      const parsed = new URL(url);

      // Must be t.me domain
      if (parsed.hostname !== "t.me") return false;

      // Get the path and remove leading/trailing slashes
      const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
      if (!path) return false;

      // Disallow private/invite links that start with +
      // Format: https://t.me/+xxx (private link)
      if (path.startsWith("+")) return false;

      // Disallow joinchat links (old invite format)
      if (path.startsWith("joinchat")) return false;

      // Disallow private channel links (c/channel_id format)
      if (path.startsWith("c/")) return false;

      // Extract username (first part before any /)
      const username = path.split("/")[0];

      // Public channel/group usernames must be 5-32 chars, alphanumeric + underscores
      // Format: https://t.me/channelname
      return /^[A-Za-z0-9_]{5,32}$/.test(username);
    } catch (e) {
      return false;
    }
  };

  // Country options (fetched) and related state
  const [countryOptions, setCountryOptions] = useState<
    { code: string; name: string; key: string }[]
  >([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // Fetch packages, credits and available country configs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please login.");
          setLoading(false);
          return;
        }

        try {
          const packagesRes = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/packages`,
            {
              headers: getAuthHeaders(),
            },
          );
          setPackages(packagesRes.data?.data || []);
        } catch (pkgErr: any) {
          console.error("Failed to fetch packages:", pkgErr);
          // If packages fail, use default packages
          setPackages([
            {
              _id: "default-1",
              name: "Starter",
              description: "100 display credits",
              displayCredits: 100,
              priceUSDT: 10,
              positions: ["HOME_BANNER"],
              duration: null,
              isActive: true,
            },
            {
              _id: "default-2",
              name: "Professional",
              description: "500 display credits",
              displayCredits: 500,
              priceUSDT: 40,
              positions: ["HOME_BANNER", "BOTTOM_CIRCLE"],
              duration: null,
              isActive: true,
            },
            {
              _id: "default-3",
              name: "Enterprise",
              description: "1000 display credits",
              displayCredits: 1000,
              priceUSDT: 70,
              positions: ["HOME_BANNER", "BOTTOM_CIRCLE"],
              duration: null,
              isActive: true,
            },
          ]);
        }

        try {
          const creditsRes = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/my-credits`,
            {
              headers: getAuthHeaders(),
            },
          );
          setCredits(
            creditsRes.data?.data || {
              totalCredits: 0,
              usedCredits: 0,
              balanceCredits: 0,
            },
          );
        } catch (creditErr: any) {
          console.error("Failed to fetch credits:", creditErr);
          // Set default zero credits
          setCredits({ totalCredits: 0, usedCredits: 0, balanceCredits: 0 });
        }

        // Fetch countries from telegramdirectory API
        try {
          setCountriesLoading(true);
          const countriesRes = await axios.get(
            `https://telegramdirectory.org/api/getCountry`,
          );
          // Filter out the Global option and map to our format
          const countryList = (countriesRes.data?.CountryData || [])
            .filter((it: any) => it.country_key !== "GLOBAL")
            .map((it: any) => ({
              code: it.country_id,
              name: it.country_name,
              key: it.country_key,
            }));

          setCountryOptions(countryList);
        } catch (countriesErr: any) {
          console.error("Failed to fetch countries:", countriesErr);
          // fallback countries if API fails
          setCountryOptions([
            { code: "1", name: "Afghanistan", key: "AFGHANISTAN" },
            { code: "2", name: "Aland Islands", key: "ALAND_ISLANDS" },
            { code: "3", name: "Albania", key: "ALBANIA" },
            { code: "98", name: "India", key: "INDIA" },
            { code: "225", name: "United States", key: "UNITED_STATES" },
            { code: "229", name: "United Kingdom", key: "UNITED_KINGDOM" },
          ]);
        } finally {
          setCountriesLoading(false);
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load advertisement data";
        setError(errorMessage);
        console.error("Advertisement data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch ad country filter config whenever create-ad tab is accessed
  useEffect(() => {
    if (activeTab === "create-ad") {
      const fetchCountryFilterConfig = async () => {
        try {
          const configRes = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/config/ad-country-filter`,
            { headers: getAuthHeaders() },
          );
          const cfgVal =
            configRes.data?.ConfigValue ?? configRes.data?.configValue;
          const enabled = String(cfgVal) === "1";
          setCountryFilterEnabled(enabled);
          if (!enabled) {
            // If disabled, force global selection
            setCountrySelection("global");
            setAdForm((prev) => ({ ...prev, country: "GLOBAL" }));
          }
        } catch (cfgErr: any) {
          console.error("Failed to fetch ad country filter config:", cfgErr);
          // Default to enabled (show both) if config fetch fails
          setCountryFilterEnabled(true);
        }
      };
      fetchCountryFilterConfig();
    }
  }, [activeTab]);

  // Fetch user's ads
  useEffect(() => {
    if (activeTab === "my-ads") {
      const fetchAds = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/my-ads`,
            {
              headers: getAuthHeaders(),
            },
          );
          setAds(res.data?.data || []);
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message ||
            "Failed to load your advertisements";
          setError(errorMessage);
          console.error("Error fetching ads:", err);
          setAds([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAds();
    }
  }, [activeTab]);

  // Fetch payment history
  useEffect(() => {
    if (activeTab === "payment-history") {
      const fetchPaymentHistory = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/payment-history`,
            {
              headers: getAuthHeaders(),
            },
          );
          setPaymentHistory(res.data?.data || []);
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message || "Failed to load payment history";
          setError(errorMessage);
          console.error("Error fetching payment history:", err);
          setPaymentHistory([]);
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentHistory();
    }
  }, [activeTab]);

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === "dashboard") {
      const fetchDashboard = async () => {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/my-stats`,
            {
              headers: getAuthHeaders(),
            },
          );
          if (res.data?.success) {
            setDashboardData(res.data?.data);
            // Store rates for use in create ad form
            if (res.data?.data?.rates) {
              setRates(res.data.data.rates);
            }
          } else {
            setDashboardError("Failed to load dashboard data");
          }
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message || "Failed to load dashboard stats";
          setDashboardError(errorMessage);
          console.error("Error fetching dashboard stats:", err);
        } finally {
          setDashboardLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [activeTab]);

  // Fetch rates when on create-ad tab if not already loaded
  useEffect(() => {
    if (activeTab === "create-ad" && !rates) {
      const fetchRates = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/v1/advertisement/my-stats`,
            {
              headers: getAuthHeaders(),
            },
          );
          if (res.data?.success && res.data?.data?.rates) {
            setRates(res.data.data.rates);
          }
        } catch (err: any) {
          console.error("Error fetching rates:", err);
          // Fallback to default rate if API fails
          setRates({
            HOME_BANNER: 1000,
            BOTTOM_CIRCLE: 1000,
          });
        }
      };
      fetchRates();
    }
  }, [activeTab, rates]);

  // Handle USDT payment - submit payment request
  const handleUsdtPayment = async () => {
    if (!selectedPackage) return;

    if (!transactionId || !walletAddress) {
      setUsdtModalError(
        "Please provide both transaction ID and wallet address",
      );
      return;
    }

    setUsdtModalLoading(true);
    setUsdtModalError(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/advertisement/buy-credits`,
        {
          packageId: selectedPackage._id,
          transactionId: transactionId,
          walletAddress: walletAddress,
        },
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        WebApp.showAlert(
          `Payment details submitted successfully! Please wait for admin approval.`,
        );

        setUsdtModalOpen(false);
        setTransactionId("");
        setWalletAddress("");
        setSelectedPackage(null);

        // Switch to payment history tab to show the pending payment
        setActiveTab("payment-history");
      }
    } catch (err: any) {
      setUsdtModalError(
        err?.response?.data?.message || "Payment submission failed",
      );
    } finally {
      setUsdtModalLoading(false);
    }
  };

  // Handle create ad
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.image) {
      setCreateAdError("Please select an image");
      return;
    }
    if (!isPublicLink) {
      setCreateAdError(
        "Telegram URL must be a public channel link (e.g., https://t.me/your_channel)",
      );
      return;
    }
    if (countrySelection === "country" && adForm.countries.length === 0) {
      setCreateAdError("Please select at least one country");
      return;
    }

    const availableBalance =
      credits?.availableCredits ?? credits?.balanceCredits ?? 0;
    if (availableBalance === 0) {
      setCreateAdError(
        "You do not have any Coupon credit to assign Adv. Buy Now",
      );
      return;
    }
    if (adForm.credits < 1) {
      setCreateAdError("Minimum 1 credit is required");
      return;
    }
    if (credits && adForm.credits > availableBalance) {
      setCreateAdError("Insufficient credits for this advertisement");
      return;
    }

    // Get the conversion rate for the selected position
    // const displaysPerCredit = rates
    //   ? rates[adForm.position as keyof typeof rates]
    //   : 1000; // fallback to 1000 if rates not loaded
    // const _ = adForm.credits * displaysPerCredit;

    setCreateAdLoading(true);
    setCreateAdError(null);
    try {
      const formData = new FormData();
      // Add sponsorId from user profile
      if (profile?._id) {
        formData.append("sponsorId", profile._id);
      }
      formData.append("position", adForm.position);
      // Send countries as comma-separated string
      formData.append("country", adForm.countries.join(","));
      formData.append("credits", String(adForm.credits));
      formData.append("redirectUrl", adForm.redirectUrl);
      formData.append("image", adForm.image);

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/advertisement/create`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data?.success) {
        WebApp.showAlert(
          "Advertisement created successfully! It will be reviewed by admin.",
        );
        setAdForm({
          position: "HOME_BANNER",
          countries: ["GLOBAL"],
          credits: 1,
          redirectUrl: "",
          image: null,
        });
        setImagePreview(null);
        // Refresh credits and ads
        const creditsRes = await axios.get(
          `${API_BASE_URL}/api/v1/advertisement/my-credits`,
          { headers: getAuthHeaders() },
        );
        setCredits(creditsRes.data?.data || null);
        setActiveTab("my-ads");
      }
    } catch (err: any) {
      setCreateAdError(err?.response?.data?.message || "Failed to create ad");
    } finally {
      setCreateAdLoading(false);
    }
  };

  // Handle fetch ad statistics
  const handleViewStats = async (adId: string) => {
    setStatsLoading(adId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        WebApp.showAlert("No authentication token found");
        setStatsLoading(null);
        return;
      }

      console.log("Fetching stats for ad:", adId);
      const stats = await getAdStatistics(adId, token);
      console.log("Stats received:", stats);

      if (!stats) {
        WebApp.showAlert("No statistics data available for this ad");
        setStatsLoading(null);
        return;
      }

      setAdStats(stats);
      setStatsModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch advertisement statistics";
      WebApp.showAlert(errorMessage);
    } finally {
      setStatsLoading(null);
    }
  };

  // Handle pause advertisement
  const handlePauseAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/advertisement/${adId}/pause`,
        {},
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        WebApp.showAlert("Advertisement paused successfully!");
        // Refresh ads list
        const adsRes = await axios.get(
          `${API_BASE_URL}/api/v1/advertisement/my-ads`,
          {
            headers: getAuthHeaders(),
          },
        );
        setAds(adsRes.data?.data || []);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err?.response?.data?.message || "Failed to pause advertisement",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resume advertisement
  const handleResumeAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/advertisement/${adId}/resume`,
        {},
        { headers: getAuthHeaders() },
      );

      if (res.data?.success) {
        WebApp.showAlert("Advertisement resumed successfully!");
        // Refresh ads list
        const adsRes = await axios.get(`${API_BASE_URL}/advertisement/my-ads`, {
          headers: getAuthHeaders(),
        });
        setAds(adsRes.data?.data || []);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err?.response?.data?.message || "Failed to resume advertisement",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete advertisement
  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }

    setActionLoading(adId);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/v1/advertisement/${adId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (res.data?.success) {
        WebApp.showAlert("Advertisement deleted successfully!");
        // Refresh ads list
        const adsRes = await axios.get(
          `${API_BASE_URL}/api/v1/advertisement/my-ads`,
          {
            headers: getAuthHeaders(),
          },
        );
        setAds(adsRes.data?.data || []);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err?.response?.data?.message || "Failed to delete advertisement",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Compute available credits for create-ad validations (respect zero)
  const availableCreditsVal =
    credits?.availableCredits ?? credits?.balanceCredits ?? 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gray-300">
      <Header />
      <main className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-md pb-24 px-4">
          {/* Page Title with Hamburger Menu */}
          <div className="bg-[#005f8e] border border-gray-200 rounded-lg shadow-md p-4 mb-6 mt-2 relative">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white text-center flex-1">
                {i18n.t("advertisement")}
              </h1>
              <button
                className="text-white hover:bg-[#004570] p-2 rounded transition"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Hamburger Menu Dropdown */}
            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#007cb6] bg-opacity-90 rounded-lg shadow-lg z-50 min-w-max">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition first:rounded-t-lg"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab("create-ad");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  Create Ad
                </button>
                <button
                  onClick={() => {
                    setActiveTab("my-ads");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  My Ads
                </button>
                <button
                  onClick={() => {
                    setActiveTab("buy-credits");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  Buy Credits
                </button>
                <button
                  onClick={() => {
                    setActiveTab("payment-history");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition last:rounded-b-lg"
                >
                  Payments
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}

          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-xl text-center font-bold text-gray-800">
              {activeTab === "dashboard"
                ? "Advertisement Dashboard"
                : activeTab === "create-ad"
                  ? "Create Advertisement"
                  : activeTab === "my-ads"
                    ? "My Advertisements"
                    : activeTab === "buy-credits"
                      ? "Buy Credits"
                      : "Payment History"}
            </h2>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {dashboardError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {dashboardError}
                </div>
              )}

              {dashboardLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">{i18n.t("loading")}</p>
                </div>
              ) : dashboardData ? (
                <div className="space-y-6">
                  {/* Credits Section */}
                  {dashboardData.credits && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Credits Overview
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Credits
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboardData.credits.total}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Used</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {dashboardData.credits.used}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Balance</p>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.credits.balance}
                          </p>
                        </div>
                      </div>

                      {(dashboardData.credits.balance ?? 0) === 0 && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-400 text-gray-800 px-4 py-3 rounded mb-4 flex items-center justify-between">
                          <p className="text-sm">
                            You do not have any Coupon credit to assign Adv.{" "}
                            <button
                              type="button"
                              onClick={() => setActiveTab("buy-credits")}
                              className="ml-2 underline font-semibold text-[#007cb6]"
                            >
                              Buy Now
                            </button>
                          </p>
                        </div>
                      )}

                      {/* Credit Rates
                      {dashboardData.rates && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Credit Rates
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">
                                Home Banner:
                              </span>
                              <p className="font-bold text-gray-800 ml-2">
                                1 credit = {dashboardData.rates.HOME_BANNER}{" "}
                                displays
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">
                                Bottom Circle:
                              </span>
                              <p className="font-bold text-gray-800 ml-2">
                                1 credit = {dashboardData.rates.BOTTOM_CIRCLE}{" "}
                                displays
                              </p>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Transaction History */}
                      {dashboardData.credits.transactions &&
                        dashboardData.credits.transactions.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                              Recent Transactions
                            </p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {dashboardData.credits.transactions.map(
                                (tx: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-gray-50 p-3 rounded text-xs border border-gray-200"
                                  >
                                    <div className="flex justify-between mb-1">
                                      <span className="font-semibold text-gray-800">
                                        +{tx.creditsAdded} Credits
                                      </span>
                                      <span className="text-green-600 font-bold">
                                        {tx.status}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                      {/* <span>ID: {tx.transactionId}</span> */}
                                      <span>${tx.amountUSDT} USDT</span>
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                      {formatDate(tx.transactionDate)}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                  {/* Summary Section
                  {dashboardData.summary && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Overall Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Display Capacity
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboardData.summary.totalDisplaysCapacity
                              ? dashboardData.summary.totalDisplaysCapacity.toLocaleString()
                              : 0}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Displays Purchased
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {dashboardData.summary.totalDisplaysPurchased
                              ? dashboardData.summary.totalDisplaysPurchased.toLocaleString()
                              : 0}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Displays Used
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {dashboardData.summary.totalDisplaysUsed
                              ? dashboardData.summary.totalDisplaysUsed.toLocaleString()
                              : 0}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Displays Remaining
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.summary.totalDisplaysRemaining
                              ? dashboardData.summary.totalDisplaysRemaining.toLocaleString()
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}
                  {/* Display Positions Section */}
                  {dashboardData.positions && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Adv Performance By Positions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Page */}
                        {dashboardData.positions.startPage && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <span className="text-lg">📱</span> Home Banner
                              (Landing Page)
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Credits Allocated:
                                </span>
                                <span className="font-semibold">
                                  {
                                    dashboardData.positions.startPage
                                      .creditAllocated
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Credits Used:
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {dashboardData.positions.startPage.creditUsed}
                                </span>
                              </div>
                              {dashboardData.positions.startPage
                                .creditAllocated > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (dashboardData.positions.startPage
                                          .creditUsed /
                                          dashboardData.positions.startPage
                                            .creditAllocated) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              <div className="flex justify-between pt-2">
                                <span className="text-gray-600">
                                  Display Capacity:
                                </span>
                                <span className="font-semibold">
                                  {dashboardData.positions.startPage
                                    .displayCapacity
                                    ? dashboardData.positions.startPage.displayCapacity.toLocaleString()
                                    : 0}
                                </span>
                              </div>
                              {/* <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Displays Purchased:
                                </span>
                                <span className="font-semibold">
                                  {dashboardData.positions.startPage
                                    .displayTotal
                                    ? dashboardData.positions.startPage.displayTotal.toLocaleString()
                                    : 0}
                                </span>
                              </div> */}
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Displays Used:
                                </span>
                                <span className="font-semibold text-green-600">
                                  {dashboardData.positions.startPage.displayUsed
                                    ? dashboardData.positions.startPage.displayUsed.toLocaleString()
                                    : 0}
                                </span>
                              </div>
                              {dashboardData.positions.startPage.displayTotal >
                                0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (dashboardData.positions.startPage
                                          .displayUsed /
                                          dashboardData.positions.startPage
                                            .displayTotal) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              <div className="-mx-4 -mb-4 mt-3 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-t border-purple-200 px-4 py-3 rounded-b-lg">
                                <div className="flex justify-between text-xs mb-2 items-center">
                                  <span className="text-gray-700 font-semibold">
                                    Active Ads:
                                  </span>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white shadow-md">
                                    {
                                      dashboardData.positions.startPage
                                        .activeAds
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs items-center">
                                  <span className="text-gray-700 font-semibold">
                                    Total Ads:
                                  </span>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-500 text-white shadow-md">
                                    {dashboardData.positions.startPage.totalAds}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bottom Circle */}
                        {dashboardData.positions.bottomCircle && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <span className="text-lg">⭕</span> Bottom Circle
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Credits Allocated:
                                </span>
                                <span className="font-semibold">
                                  {
                                    dashboardData.positions.bottomCircle
                                      .creditAllocated
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Credits Used:
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {
                                    dashboardData.positions.bottomCircle
                                      .creditUsed
                                  }
                                </span>
                              </div>
                              {dashboardData.positions.bottomCircle
                                .creditAllocated > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (dashboardData.positions.bottomCircle
                                          .creditUsed /
                                          dashboardData.positions.bottomCircle
                                            .creditAllocated) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              <div className="flex justify-between pt-2">
                                <span className="text-gray-600">
                                  Display Capacity:
                                </span>
                                <span className="font-semibold">
                                  {dashboardData.positions.bottomCircle
                                    .displayCapacity
                                    ? dashboardData.positions.bottomCircle.displayCapacity.toLocaleString()
                                    : 0}
                                </span>
                              </div>
                              {/* <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Displays Purchased:
                                </span>
                                <span className="font-semibold">
                                  {dashboardData.positions.bottomCircle
                                    .displayTotal
                                    ? dashboardData.positions.bottomCircle.displayTotal.toLocaleString()
                                    : 0}
                                </span>
                              </div> */}
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Displays Used:
                                </span>
                                <span className="font-semibold text-green-600">
                                  {dashboardData.positions.bottomCircle
                                    .displayUsed
                                    ? dashboardData.positions.bottomCircle.displayUsed.toLocaleString()
                                    : 0}
                                </span>
                              </div>
                              {dashboardData.positions.bottomCircle
                                .displayTotal > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        (dashboardData.positions.bottomCircle
                                          .displayUsed /
                                          dashboardData.positions.bottomCircle
                                            .displayTotal) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              <div className="-mx-4 -mb-4 mt-3 bg-gradient-to-r from-orange-50 via-pink-50 to-orange-50 border-t border-orange-200 px-4 py-3 rounded-b-lg">
                                <div className="flex justify-between text-xs mb-2 items-center">
                                  <span className="text-gray-700 font-semibold">
                                    Active Ads:
                                  </span>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white shadow-md">
                                    {
                                      dashboardData.positions.bottomCircle
                                        .activeAds
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs items-center">
                                  <span className="text-gray-700 font-semibold">
                                    Total Ads:
                                  </span>
                                  <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-500 text-white shadow-md">
                                    {
                                      dashboardData.positions.bottomCircle
                                        .totalAds
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No dashboard data available</p>
                </div>
              )}
            </>
          )}

          {/* Buy Credits Tab */}
          {activeTab === "buy-credits" && !loading && (
            <div className="space-y-4">
              <p className="text-sm text-black mb-4">
                Select a package to purchase advertisement credits
              </p>

              {/* Sub-tabs for Start Page / Circle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setBuyTab("start");
                    setSelectedPackage(null);
                  }}
                  className={`flex-1 py-2 rounded font-semibold ${
                    buyTab === "start"
                      ? "bg-[#007cb6] text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  SCoupon (Landing Page)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuyTab("circle");
                    setSelectedPackage(null);
                  }}
                  className={`flex-1 py-2 rounded font-semibold ${
                    buyTab === "circle"
                      ? "bg-[#007cb6] text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  CCoupon (Bottom Bar)
                </button>
              </div>

              {/* Packages list filtered by selected sub-tab */}
              {packages.filter((pkg) =>
                buyTab === "start"
                  ? pkg.positions.includes("HOME_BANNER")
                  : pkg.positions.includes("BOTTOM_CIRCLE"),
              ).length === 0 ? (
                <div className="text-center py-6 text-gray-600">
                  No packages available for this section.
                </div>
              ) : (
                packages
                  .filter((pkg) =>
                    buyTab === "start"
                      ? pkg.positions.includes("HOME_BANNER")
                      : pkg.positions.includes("BOTTOM_CIRCLE"),
                  )
                  .map((pkg) => (
                    <div
                      key={pkg._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedPackage?._id === pkg._id
                          ? "bg-[#007cb6] text-black"
                          : "border-gray-200 hover:border-[#007cb6]"
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-black">{pkg.name}</h3>
                        <span className="bg-[#007cb6] text-black px-2 py-1 rounded text-base font-bold">
                          ${pkg.priceUSDT}
                        </span>
                      </div>
                      <p className="text-sm text-black mb-2">
                        {pkg.description}
                      </p>
                      <div className="text-base text-black space-y-1">
                        <p>💳 Credits: {pkg.displayCredits}</p>
                        {/* TODO : Add no of display */}
                        <p>
                          📍 Position:{" "}
                          {pkg.positions.includes("HOME_BANNER")
                            ? "Landing Page Banner"
                            : "Bottom Bar Circle"}
                        </p>
                      </div>
                    </div>
                  ))
              )}

              {selectedPackage && (
                <button
                  onClick={() => setUsdtModalOpen(true)}
                  className="w-full bg-[#007cb6] text-black py-3 rounded-lg font-bold hover:bg-[#005f8e] transition"
                >
                  Pay with USDT
                </button>
              )}
            </div>
          )}

          {/* Create Ad Tab */}
          {activeTab === "create-ad" && !loading && (
            <>
              {availableCreditsVal === 0 ? (
                <div className="bg-yellow-50 border border-yellow-400 text-red-500 px-4 py-3 rounded mb-4">
                  <p className="font-semibold text-center">
                    No Available Credits
                  </p>
                  <p className="text-sm mt-1">
                    You do not have any available credit in your account. Please{" "}
                    <button
                      type="button"
                      className="underline font-semibold text-[#007cb6] ml-1"
                      onClick={() => setActiveTab("buy-credits")}
                    >
                      Buy Now
                    </button>{" "}
                    before creating advertisements.
                  </p>
                </div>
              ) : null}

              {/* Sub-tabs for Landing Page / Circle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setCreateAdTab("start");
                    setAdForm({
                      ...adForm,
                      position: "HOME_BANNER",
                      credits: 1,
                    });
                  }}
                  className={`flex-1 py-2 rounded font-semibold ${
                    createAdTab === "start"
                      ? "bg-[#007cb6] text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  Landing Page Banner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateAdTab("circle");
                    setAdForm({
                      ...adForm,
                      position: "BOTTOM_CIRCLE",
                      credits: 1,
                    });
                  }}
                  className={`flex-1 py-2 rounded font-semibold ${
                    createAdTab === "circle"
                      ? "bg-[#007cb6] text-white"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  Bottom Bar Circle
                </button>
              </div>

              <form onSubmit={handleCreateAd} className="space-y-4">
                {createAdError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {createAdError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Select your adv Position *
                  </label>
                  <select
                    value={adForm.position}
                    onChange={(e) =>
                      setAdForm({ ...adForm, position: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="HOME_BANNER">Landing Page Banner</option>
                    <option value="BOTTOM_CIRCLE">Bottom Bar Circle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Select Targeting Option *
                  </label>
                  <div className="space-y-3">
                    {countryFilterEnabled === false ? (
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="global-option"
                          name="targeting"
                          value="global"
                          checked={true}
                          readOnly
                          className="h-4 w-4 text-[#007cb6]"
                        />
                        <label
                          htmlFor="global-option"
                          className="ml-2 cursor-pointer text-gray-700"
                        >
                          Global (All Countries)
                        </label>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="global-option"
                            name="targeting"
                            value="global"
                            checked={countrySelection === "global"}
                            onChange={(e) => {
                              setCountrySelection("global");
                              setAdForm({ ...adForm, countries: ["GLOBAL"] });
                              console.log("Set country to GLOBAL", e);
                            }}
                            className="h-4 w-4 text-[#007cb6]"
                          />
                          <label
                            htmlFor="global-option"
                            className="ml-2 cursor-pointer text-gray-700"
                          >
                            Global (All Countries)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="country-option"
                            name="targeting"
                            value="country"
                            checked={countrySelection === "country"}
                            onChange={(e) => {
                              setCountrySelection("country");
                              console.log("Set country to specific", e);
                            }}
                            className="h-4 w-4 text-[#007cb6]"
                          />
                          <label
                            htmlFor="country-option"
                            className="ml-2 cursor-pointer text-gray-700"
                          >
                            Specific Country
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {countrySelection === "country" && (
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Select Countries *
                    </label>
                    <select
                      multiple
                      value={adForm.countries}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );
                        setAdForm({ ...adForm, countries: selected });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[120px]"
                    >
                      {countryOptions.map((c) => (
                        <option key={c.code} value={c.key}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {adForm.countries.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {adForm.countries.map((country) => (
                          <span
                            key={country}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded"
                          >
                            {countryOptions.find((c) => c.key === country)
                              ?.name || country}
                            <button
                              type="button"
                              onClick={() => {
                                setAdForm({
                                  ...adForm,
                                  countries: adForm.countries.filter(
                                    (c) => c !== country,
                                  ),
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {countriesLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading countries...
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Number of Credits *
                  </label>
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Available Credits:</span>{" "}
                      <span className="text-blue-600 font-bold">
                        {adForm.position === "HOME_BANNER"
                          ? (dashboardData?.positions?.startPage
                              ?.creditAllocated ?? availableCreditsVal)
                          : (dashboardData?.positions?.bottomCircle
                              ?.creditAllocated ?? availableCreditsVal)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {rates ? (
                        <>
                          1 credit ={" "}
                          {rates[
                            adForm.position as keyof typeof rates
                          ].toLocaleString()}{" "}
                          displays
                          {/* <br />
                          <span className="text-gray-500 italic">
                            (Rate for{" "}
                            {adForm.position === "HOME_BANNER"
                              ? "Start Page Banner"
                              : "Bottom Circle"}
                            )
                          </span> */}
                        </>
                      ) : (
                        "Loading rates..."
                      )}
                    </p>
                  </div>
                  {(() => {
                    const positionCredits =
                      adForm.position === "HOME_BANNER"
                        ? (dashboardData?.positions?.startPage
                            ?.creditAllocated ?? availableCreditsVal)
                        : (dashboardData?.positions?.bottomCircle
                            ?.creditAllocated ?? availableCreditsVal);
                    const maxCredits =
                      positionCredits > 0 ? positionCredits : 1;

                    return (
                      <>
                        <input
                          type="number"
                          min="1"
                          max={maxCredits}
                          value={maxCredits === 0 ? 0 : adForm.credits}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setAdForm({
                              ...adForm,
                              credits: Math.max(1, Math.min(value, maxCredits)),
                            });
                          }}
                          disabled={maxCredits === 0}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {rates && (
                            <>
                              <span className="font-semibold">Displays:</span>{" "}
                              {(
                                (maxCredits === 0 ? 0 : adForm.credits) *
                                rates[adForm.position as keyof typeof rates]
                              ).toLocaleString()}{" "}
                              ({maxCredits === 0 ? 0 : adForm.credits} credit
                              {(maxCredits === 0 ? 0 : adForm.credits) !== 1
                                ? "s"
                                : ""}{" "}
                              ×{" "}
                              {rates[
                                adForm.position as keyof typeof rates
                              ].toLocaleString()}{" "}
                              displays/credit)
                            </>
                          )}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Telegram URL ( Only Public Channel/Groups) *
                  </label>
                  <input
                    type="text"
                    placeholder="https://t.me/channel_name"
                    value={adForm.redirectUrl}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setAdForm({ ...adForm, redirectUrl: v });
                      setIsPublicLink(isTelegramPublicLink(v));
                      if (createAdError) setCreateAdError(null);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  {adForm.redirectUrl && (
                    <p
                      className={`text-xs mt-1 ${
                        isPublicLink ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isPublicLink
                        ? ""
                        : "Please enter a public Telegram channel link (no invite/private links)"}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Upload Image (PNG/JPG) *
                    <p className="text-base text-blue-600 font-medium">
                      {adForm.position === "HOME_BANNER"
                        ? "Image aspect ratio should be 1:1 (Square) for best display."
                        : "Image aspect ratio should be 1:1 (Circle) for best display."}
                    </p>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        // Validate that only image files are selected
                        if (file) {
                          const validImageTypes = [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                            "image/webp",
                          ];

                          if (!validImageTypes.includes(file.type)) {
                            setCreateAdError(
                              "Please select a valid image file (PNG, JPG, or WEBP only)",
                            );
                            e.target.value = ""; // Clear the input
                            return;
                          }

                          // Clear any previous errors
                          if (createAdError?.includes("image file")) {
                            setCreateAdError(null);
                          }
                        }

                        setAdForm({
                          ...adForm,
                          image: file,
                        });
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="image-upload"
                    />
                    {imagePreview ? (
                      <label
                        htmlFor="image-upload"
                        className={`relative border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer overflow-hidden group block ${
                          adForm.position === "HOME_BANNER"
                            ? "w-full h-48 rounded-lg"
                            : "h-64 w-64 mx-auto rounded-full"
                        }`}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Change Image
                          </span>
                        </div>
                      </label>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
                          adForm.position === "HOME_BANNER"
                            ? "w-full h-48 rounded-lg"
                            : "h-64 w-64 mx-auto rounded-full"
                        }`}
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600 mt-2">
                            Click to Upload Image
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-2 flex items-center text-green-600">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs">✓ {adForm.image?.name}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    createAdLoading ||
                    !isPublicLink ||
                    availableCreditsVal === 0
                  }
                  className="w-full bg-[#007cb6] text-white py-3 rounded-lg font-bold hover:bg-[#005f8e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAdLoading
                    ? i18n.t("submitting")
                    : "Create Advertisement"}
                </button>
                {/* {!isPublicLink && (
                  <p className="text-xs text-red-500 mt-2">
                    Create disabled: Telegram link must be a public channel
                    link.
                  </p>
                )} */}
              </form>
            </>
          )}
          {/* My Ads Tab */}
          {activeTab === "my-ads" && !loading && (
            <div className="space-y-4">
              {/* Filter buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAdStatusFilter("all")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    adStatusFilter === "all"
                      ? "bg-[#007cb6] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setAdStatusFilter("active")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    adStatusFilter === "active"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🟢 Active
                </button>
                <button
                  onClick={() => setAdStatusFilter("consumed")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    adStatusFilter === "consumed"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🔴 Consumed
                </button>
              </div>

              {ads.filter((ad) => {
                if (adStatusFilter === "all") return true;
                if (adStatusFilter === "active")
                  return (
                    ad.status.toLowerCase() === "active" ||
                    ad.status.toLowerCase() === "paused"
                  );
                if (adStatusFilter === "consumed")
                  return (
                    ad.status.toLowerCase() !== "active" &&
                    ad.status.toLowerCase() !== "paused"
                  );
                return true;
              }).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {ads.length === 0
                      ? "No advertisements yet"
                      : `No ${adStatusFilter} advertisements`}
                  </p>
                </div>
              ) : (
                ads
                  .filter((ad) => {
                    if (adStatusFilter === "all") return true;
                    if (adStatusFilter === "active")
                      return (
                        ad.status.toLowerCase() === "active" ||
                        ad.status.toLowerCase() === "paused"
                      );
                    if (adStatusFilter === "consumed")
                      return (
                        ad.status.toLowerCase() !== "active" &&
                        ad.status.toLowerCase() !== "paused"
                      );
                    return true;
                  })
                  .map((ad) => (
                    <div
                      key={ad._id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPaymentId(
                            openPaymentId === ad._id ? null : ad._id,
                          )
                        }
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#007cb6] text-white px-2 py-1 rounded text-xs font-bold">
                              {ad.position}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                ad.status.toLowerCase() === "active"
                                  ? "bg-green-100 text-green-800"
                                  : ad.status.toLowerCase() === "paused"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ad.status.toLowerCase() === "active"
                                ? "🟢 Active"
                                : ad.status.toLowerCase() === "paused"
                                  ? "🟡 Paused"
                                  : "🔴 Consumed"}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-800">
                            {ad.country}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Created: {formatDate(ad.createdAt)}
                          </p>
                        </div>
                        <svg
                          className={`h-4 w-4 text-gray-500 transform transition-transform flex-shrink-0 ${
                            openPaymentId === ad._id ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 8l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {openPaymentId === ad._id && (
                        <div className="p-4 bg-gray-50 space-y-3">
                          {ad.imageUrl && (
                            <div className="bg-white p-3 rounded shadow-sm">
                              <img
                                src={ad.imageUrl}
                                alt="Ad"
                                className="w-full h-40 object-contain rounded"
                              />
                            </div>
                          )}

                          <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">
                              Target URL
                            </p>
                            <a
                              href={ad.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline break-all"
                            >
                              {ad.redirectUrl}
                            </a>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">Displays</p>
                              <p className="font-bold text-sm">
                                {ad.displayUsed} / {ad.displayCount}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">
                                Views / Clicks
                              </p>
                              <p className="font-bold text-sm">
                                {ad.viewCount} / {ad.clickCount}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">CTR</p>
                              <p className="font-bold text-sm">
                                {ad.ctrPercentage.toFixed(2)}%
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">Progress</p>
                              <div className="w-full bg-gray-300 rounded h-2 mt-1">
                                <div
                                  className="bg-[#007cb6] h-2 rounded"
                                  style={{
                                    width: `${
                                      (ad.displayUsed / ad.displayCount) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="flex gap-2">
                              {ad.status === "active" && (
                                <button
                                  onClick={() => handlePauseAd(ad._id)}
                                  disabled={actionLoading === ad._id}
                                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 disabled:opacity-50"
                                >
                                  {actionLoading === ad._id ? "..." : "⏸ Pause"}
                                </button>
                              )}
                              {ad.status === "paused" && (
                                <button
                                  onClick={() => handleResumeAd(ad._id)}
                                  disabled={actionLoading === ad._id}
                                  className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50"
                                >
                                  {actionLoading === ad._id
                                    ? "..."
                                    : "▶ Resume"}
                                </button>
                              )}
                              <button
                                onClick={() => handleViewStats(ad._id)}
                                disabled={statsLoading === ad._id}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
                              >
                                {statsLoading === ad._id ? "..." : "📊 Stats"}
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad._id)}
                                disabled={actionLoading === ad._id}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                              >
                                {actionLoading === ad._id ? "..." : "🗑 Delete"}
                              </button>
                            </div>
                            {ad.displayUsed >= ad.displayCount && (
                              <button
                                onClick={() => {
                                  setActiveTab("buy-credits");
                                }}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition"
                              >
                                ✨ Renew Credits
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "payment-history" && !loading && (
            <div className="space-y-4">
              {/* Filter buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPaymentStatusFilter("all")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    paymentStatusFilter === "all"
                      ? "bg-[#007cb6] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentStatusFilter("pending")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    paymentStatusFilter === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🟡 Pending
                </button>
                <button
                  onClick={() => setPaymentStatusFilter("approved")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    paymentStatusFilter === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🟢 Approved
                </button>
                <button
                  onClick={() => setPaymentStatusFilter("rejected")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    paymentStatusFilter === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🔴 Rejected
                </button>
              </div>

              {paymentHistory.filter((payment) => {
                if (paymentStatusFilter === "all") return true;
                if (paymentStatusFilter === "pending")
                  return payment.status === 0;
                if (paymentStatusFilter === "approved")
                  return payment.status === 1;
                if (paymentStatusFilter === "rejected")
                  return payment.status === 2;
                return true;
              }).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {paymentHistory.length === 0
                      ? "No payment history yet"
                      : `No ${paymentStatusFilter} payments`}
                  </p>
                </div>
              ) : (
                paymentHistory
                  .filter((payment) => {
                    if (paymentStatusFilter === "all") return true;
                    if (paymentStatusFilter === "pending")
                      return payment.status === 0;
                    if (paymentStatusFilter === "approved")
                      return payment.status === 1;
                    if (paymentStatusFilter === "rejected")
                      return payment.status === 2;
                    return true;
                  })
                  .map((payment) => {
                    const statusConfig = {
                      0: {
                        label: "Pending",
                        color: "bg-yellow-100 text-yellow-800",
                      },
                      1: {
                        label: "Approved",
                        color: "bg-green-100 text-green-800",
                      },
                      2: {
                        label: "Rejected",
                        color: "bg-red-100 text-red-800",
                      },
                    };
                    const config =
                      statusConfig[payment.status as keyof typeof statusConfig];

                    return (
                      <div
                        key={payment._id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenPaymentId(
                              openPaymentId === payment._id
                                ? null
                                : payment._id,
                            )
                          }
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-800">
                              {payment.package.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${config.color}`}
                            >
                              {config.label}
                            </span>
                            <svg
                              className={`h-4 w-4 text-gray-500 transform transition-transform ${
                                openPaymentId === payment._id
                                  ? "rotate-180"
                                  : ""
                              }`}
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 8l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </button>

                        {openPaymentId === payment._id && (
                          <div className="p-4 bg-gray-50 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-2 rounded shadow-sm">
                                <p className="text-xs text-gray-600">Amount</p>
                                <p className="font-bold">
                                  ${payment.amount} USDT
                                </p>
                              </div>
                              <div className="bg-white p-2 rounded shadow-sm">
                                <p className="text-xs text-gray-600">Credits</p>
                                <p className="font-bold">{payment.credits}</p>
                              </div>
                              <div className="col-span-2 bg-white p-2 rounded shadow-sm">
                                <p className="text-xs text-gray-600">
                                  Transaction ID
                                </p>
                                <p className="text-xs font-mono break-all">
                                  {payment.transactionId}
                                </p>
                              </div>
                              <div className="col-span-2 bg-white p-2 rounded shadow-sm">
                                <p className="text-xs text-gray-600">
                                  Wallet Address
                                </p>
                                <p className="text-xs font-mono break-all">
                                  {payment.walletAddress}
                                </p>
                              </div>
                            </div>

                            {payment.status === 1 && payment.approvalNotes && (
                              <div className="bg-green-50 p-2 rounded">
                                <p className="text-xs text-green-600 font-semibold">
                                  Admin Notes:
                                </p>
                                <p className="text-xs text-green-800">
                                  {payment.approvalNotes}
                                </p>
                              </div>
                            )}

                            {payment.status === 2 &&
                              payment.rejectionReason && (
                                <div className="bg-red-50 p-2 rounded">
                                  <p className="text-xs text-red-600 font-semibold">
                                    Rejection Reason:
                                  </p>
                                  <p className="text-xs text-red-800">
                                    {payment.rejectionReason}
                                  </p>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {/* USDT Payment Modal */}
          {usdtModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-xs relative max-h-[90vh] flex flex-col">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl z-10"
                  onClick={() => {
                    setUsdtModalOpen(false);
                    setTransactionId("");
                    setWalletAddress("");
                    setSelectedPackage(null);
                    setUsdtModalError(null);
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <div className="overflow-y-auto p-6">
                  <h3 className="text-lg font-bold text-[#007cb6] mb-4 text-center">
                    Purchase Advertisement Credits
                  </h3>

                  <div className="mb-3 text-sm text-white bg-[#005f8e] p-3 rounded-lg">
                    <div className="mb-2">
                      <span className="font-semibold">Package: </span>
                      {selectedPackage?.name ?? "-"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Price: </span>$
                      {selectedPackage?.priceUSDT ?? "-"} USDT
                    </div>
                    <div>
                      <span className="font-semibold">Credits: </span>
                      {selectedPackage?.displayCredits ?? "-"}
                    </div>
                    {/* TODO : Add no of display */}
                  </div>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 mb-3">
                    <div className="font-semibold mb-1 text-center">
                      Send USDT to verified wallet address
                    </div>
                    <div className="text-sm font-semibold text-green-600 mb-2 text-center">
                      No Fees No charges!!!
                    </div>
                    <div className="font-medium mb-1">Steps:</div>
                    <ol className="list-decimal list-inside text-sm">
                      <li>Send USDT to the provided wallet address</li>
                      <li>Enter your transaction ID below</li>
                      <li>Enter the wallet address you sent from</li>
                      <li>Submit for admin verification</li>
                    </ol>
                    <div className="mt-3 text-sm break-all bg-gray-100 p-3 rounded-lg text-center">
                      <div className="mb-1 text-center font-semibold">
                        Send USDT to this address:
                      </div>
                      <button
                        className="text-blue-600 underline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              "TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz",
                            );
                            WebApp.showAlert("Wallet address copied!");
                          } catch (e) {
                            WebApp.showAlert("Failed to copy address");
                          }
                        }}
                      >
                        TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz
                      </button>
                    </div>
                  </div>

                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    disabled={usdtModalLoading}
                  />

                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Your wallet address (e.g., 0x...)"
                    disabled={usdtModalLoading}
                  />

                  {usdtModalError && (
                    <div className="text-red-500 text-sm mb-2">
                      {usdtModalError}
                    </div>
                  )}

                  <button
                    className="w-full bg-gradient-to-r from-[#007cb6] to-[#00a8e8] text-white font-semibold py-2 rounded-lg mt-2 hover:from-[#00a8e8] hover:to-[#007cb6] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                    onClick={handleUsdtPayment}
                    disabled={
                      usdtModalLoading || !transactionId || !walletAddress
                    }
                  >
                    {usdtModalLoading ? "Submitting..." : "Submit Payment"}
                  </button>

                  <div className="h-10 w-5"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Statistics Panel Modal */}
      {statsModalOpen && adStats && (
        <AdStatisticsPanel
          stats={adStats}
          isOpen={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setAdStats(null);
          }}
        />
      )}
    </div>
  );
}
