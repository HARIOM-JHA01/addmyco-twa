import { useState, useEffect } from "react";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import Header from "../components/Header";
import Footer from "../components/Footer";
import i18n from "../i18n";

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

type TabType = "buy-credits" | "create-ad" | "my-ads" | "payment-history";

export default function AdvertisementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("buy-credits");
  const [packages, setPackages] = useState<Package[]>([]);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buy credits state
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [usdtModalOpen, setUsdtModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [usdtModalLoading, setUsdtModalLoading] = useState(false);
  const [usdtModalError, setUsdtModalError] = useState<string | null>(null);

  // Ad action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create ad state
  const [createAdLoading, setCreateAdLoading] = useState(false);
  const [createAdError, setCreateAdError] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({
    position: "HOME_BANNER",
    country: "GLOBAL",
    displayCount: 1000,
    redirectUrl: "",
    image: null as File | null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch packages and credits
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
            }
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
            }
          );
          setCredits(
            creditsRes.data?.data || {
              totalCredits: 0,
              usedCredits: 0,
              balanceCredits: 0,
            }
          );
        } catch (creditErr: any) {
          console.error("Failed to fetch credits:", creditErr);
          // Set default zero credits
          setCredits({ totalCredits: 0, usedCredits: 0, balanceCredits: 0 });
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

  // Fetch user's ads
  useEffect(() => {
    if (activeTab === "my-ads") {
      const fetchAds = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/advertisement/my-ads`, {
            headers: getAuthHeaders(),
          });
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
            `${API_BASE_URL}/advertisement/payment-history`,
            {
              headers: getAuthHeaders(),
            }
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

  // Handle USDT payment - submit payment request
  const handleUsdtPayment = async () => {
    if (!selectedPackage) return;

    if (!transactionId || !walletAddress) {
      setUsdtModalError(
        "Please provide both transaction ID and wallet address"
      );
      return;
    }

    setUsdtModalLoading(true);
    setUsdtModalError(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/advertisement/buy-credits`,
        {
          packageId: selectedPackage._id,
          transactionId: transactionId,
          walletAddress: walletAddress,
        },
        { headers: getAuthHeaders() }
      );

      if (res.data?.success) {
        WebApp.showAlert(
          `Payment submitted successfully! Your payment request is pending admin approval. You will be notified once approved.`
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
        err?.response?.data?.message || "Payment submission failed"
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
    if (!adForm.redirectUrl.startsWith("https://t.me/")) {
      setCreateAdError("Telegram URL must start with https://t.me/");
      return;
    }

    const requiredCredits = Math.ceil(adForm.displayCount / 1000);
    const availableBalance =
      credits?.availableCredits || credits?.balanceCredits || 0;
    if (credits && requiredCredits > availableBalance) {
      setCreateAdError("Insufficient credits for this advertisement");
      return;
    }

    setCreateAdLoading(true);
    setCreateAdError(null);
    try {
      const formData = new FormData();
      formData.append("title", `Ad - ${adForm.position}`);
      formData.append("description", `Advertisement for ${adForm.country}`);
      formData.append("position", adForm.position);
      formData.append("country", adForm.country);
      formData.append("credits", String(requiredCredits));
      formData.append("targetUrl", adForm.redirectUrl);
      formData.append("image", adForm.image);

      const res = await axios.post(
        `${API_BASE_URL}/advertisement/create`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.success) {
        WebApp.showAlert(
          "Advertisement created successfully! It will be reviewed by admin."
        );
        setAdForm({
          position: "HOME_BANNER",
          country: "GLOBAL",
          displayCount: 1000,
          redirectUrl: "",
          image: null,
        });
        // Refresh credits and ads
        const creditsRes = await axios.get(
          `${API_BASE_URL}/advertisement/my-credits`,
          { headers: getAuthHeaders() }
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

  // Handle pause advertisement
  const handlePauseAd = async (adId: string) => {
    setActionLoading(adId);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/advertisement/${adId}/pause`,
        {},
        { headers: getAuthHeaders() }
      );

      if (res.data?.success) {
        WebApp.showAlert("Advertisement paused successfully!");
        // Refresh ads list
        const adsRes = await axios.get(`${API_BASE_URL}/advertisement/my-ads`, {
          headers: getAuthHeaders(),
        });
        setAds(adsRes.data?.data || []);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err?.response?.data?.message || "Failed to pause advertisement"
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
        { headers: getAuthHeaders() }
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
        err?.response?.data?.message || "Failed to resume advertisement"
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
      const res = await axios.delete(`${API_BASE_URL}/advertisement/${adId}`, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success) {
        WebApp.showAlert("Advertisement deleted successfully!");
        // Refresh ads list
        const adsRes = await axios.get(`${API_BASE_URL}/advertisement/my-ads`, {
          headers: getAuthHeaders(),
        });
        setAds(adsRes.data?.data || []);
      }
    } catch (err: any) {
      WebApp.showAlert(
        err?.response?.data?.message || "Failed to delete advertisement"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      className="bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col"
      style={{ backgroundImage: "var(--app-background-image)" }}
    >
      <Header />
      <main className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-md pb-24 px-4">
          {/* Page Title */}
          <div className="mt-6 mb-6 text-center">
            <h1 className="text-3xl font-bold text-[#007cb6]">
              {i18n.t("advertisement")}
            </h1>
          </div>

          {/* Credit Balance Card */}
          {credits && (
            <div className="bg-gradient-to-r from-[#007cb6] to-[#005f8e] text-white rounded-lg p-4 mb-6 shadow-md">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs opacity-80">Total Credits</p>
                  <p className="text-lg font-bold">{credits.totalCredits}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Used</p>
                  <p className="text-lg font-bold">{credits.usedCredits}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Available</p>
                  <p className="text-lg font-bold">
                    {credits.availableCredits || credits.balanceCredits}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab("buy-credits")}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "buy-credits"
                  ? "bg-[#007cb6] text-white"
                  : "bg-transparent text-gray-700"
              }`}
            >
              Buy Credits
            </button>
            <button
              onClick={() => setActiveTab("create-ad")}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "create-ad"
                  ? "bg-[#007cb6] text-white"
                  : "bg-transparent text-gray-700"
              }`}
            >
              Create Ad
            </button>
            <button
              onClick={() => setActiveTab("my-ads")}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "my-ads"
                  ? "bg-[#007cb6] text-white"
                  : "bg-transparent text-gray-700"
              }`}
            >
              My Ads
            </button>
            <button
              onClick={() => setActiveTab("payment-history")}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition whitespace-nowrap ${
                activeTab === "payment-history"
                  ? "bg-[#007cb6] text-white"
                  : "bg-transparent text-gray-700"
              }`}
            >
              Payments
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">{i18n.t("loading")}</p>
            </div>
          )}

          {/* Buy Credits Tab */}
          {activeTab === "buy-credits" && !loading && (
            <div className="space-y-4">
              <p className="text-sm text-white mb-4">
                Select a package to purchase advertisement credits
              </p>
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedPackage?._id === pkg._id
                      ? "border-[#007cb6] bg-blue-50"
                      : "border-gray-200 hover:border-[#007cb6]"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#007cb6]">{pkg.name}</h3>
                    <span className="bg-[#007cb6] text-white px-2 py-1 rounded text-xs font-bold">
                      ${pkg.priceUSDT}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {pkg.description}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>💳 Credits: {pkg.displayCredits}</p>
                    <p>📍 Positions: {pkg.positions.join(", ")}</p>
                  </div>
                </div>
              ))}

              {selectedPackage && (
                <button
                  onClick={() => setUsdtModalOpen(true)}
                  className="w-full bg-[#007cb6] text-white py-3 rounded-lg font-bold hover:bg-[#005f8e] transition"
                >
                  Pay with USDT
                </button>
              )}
            </div>
          )}

          {/* Create Ad Tab */}
          {activeTab === "create-ad" && !loading && (
            <form onSubmit={handleCreateAd} className="space-y-4">
              {createAdError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {createAdError}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Position *
                </label>
                <select
                  value={adForm.position}
                  onChange={(e) =>
                    setAdForm({ ...adForm, position: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="HOME_BANNER">Home Page Banner (1:1)</option>
                  <option value="BOTTOM_CIRCLE">
                    Bottom Navigation Circle (1:1)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Country/Global *
                </label>
                <select
                  value={adForm.country}
                  onChange={(e) =>
                    setAdForm({ ...adForm, country: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="GLOBAL">Global</option>
                  <option value="US">United States</option>
                  <option value="CN">China</option>
                  <option value="GB">United Kingdom</option>
                  <option value="IN">India</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Number of Displays *
                </label>
                <input
                  type="number"
                  min="100"
                  value={adForm.displayCount}
                  onChange={(e) =>
                    setAdForm({
                      ...adForm,
                      displayCount: parseInt(e.target.value) || 1000,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requires {Math.ceil(adForm.displayCount / 1000)} credit(s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Telegram URL *
                </label>
                <input
                  type="text"
                  placeholder="https://t.me/channel_name"
                  value={adForm.redirectUrl}
                  onChange={(e) =>
                    setAdForm({ ...adForm, redirectUrl: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Upload Image (PNG/JPG) *
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    setAdForm({
                      ...adForm,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {adForm.image && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {adForm.image.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createAdLoading}
                className="w-full bg-[#007cb6] text-white py-3 rounded-lg font-bold hover:bg-[#005f8e] transition disabled:opacity-50"
              >
                {createAdLoading
                  ? i18n.t("submitting")
                  : "Create Advertisement"}
              </button>
            </form>
          )}

          {/* My Ads Tab */}
          {activeTab === "my-ads" && !loading && (
            <div className="space-y-4">
              {ads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No advertisements yet</p>
                </div>
              ) : (
                ads.map((ad) => (
                  <div
                    key={ad._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="bg-[#007cb6] text-white px-2 py-1 rounded text-xs font-bold">
                          {ad.position}
                        </span>
                        <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                          {ad.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{ad.country}</p>
                    </div>

                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt="Ad"
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}

                    <a
                      href={ad.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline mb-3 block truncate"
                    >
                      {ad.redirectUrl}
                    </a>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Displays</p>
                        <p className="font-bold">
                          {ad.displayUsed} / {ad.displayCount}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Views / Clicks</p>
                        <p className="font-bold">
                          {ad.viewCount} / {ad.clickCount}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">CTR</p>
                        <p className="font-bold">
                          {ad.ctrPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">Progress</p>
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

                    <p className="text-xs text-gray-500 mb-3">
                      Created: {new Date(ad.createdAt).toLocaleDateString()}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
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
                          {actionLoading === ad._id ? "..." : "▶ Resume"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAd(ad._id)}
                        disabled={actionLoading === ad._id}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                      >
                        {actionLoading === ad._id ? "..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "payment-history" && !loading && (
            <div className="space-y-4">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No payment history yet</p>
                </div>
              ) : (
                paymentHistory.map((payment) => {
                  const statusConfig = {
                    0: {
                      label: "Pending",
                      color: "bg-yellow-100 text-yellow-800",
                      icon: "⏳",
                    },
                    1: {
                      label: "Approved",
                      color: "bg-green-100 text-green-800",
                      icon: "✅",
                    },
                    2: {
                      label: "Rejected",
                      color: "bg-red-100 text-red-800",
                      icon: "❌",
                    },
                  };
                  const config =
                    statusConfig[payment.status as keyof typeof statusConfig];

                  return (
                    <div
                      key={payment._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-[#007cb6]">
                            {payment.package.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${config.color}`}
                        >
                          {config.icon} {config.label}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-bold">${payment.amount} USDT</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Credits</p>
                          <p className="font-bold">{payment.credits}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">
                            Transaction ID
                          </p>
                          <p className="text-xs font-mono break-all">
                            {payment.transactionId}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
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

                      {payment.status === 2 && payment.rejectionReason && (
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

                  <div className="mb-3 text-sm text-gray-700">
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
                              "TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz"
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
    </div>
  );
}
