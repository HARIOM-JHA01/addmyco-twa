import { useProfileStore } from "../store/profileStore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import axios from "axios";
import WebApp from "@twa-dev/sdk";

const PREMIUM_FEATURES = [
  { label: "Custom Username/Url", value: "Yes" },
  { label: "Contact list", value: "Unlimited" },
  { label: "Folder", value: "Unlimited" },
  { label: "Profile image", value: "image or Video" },
  { label: "Background image upload", value: "Yes" },
  { label: "Subsidiary company", value: "Unlimited" },
  { label: "Chamber", value: "Unlimited" },
];

const BASIC_FEATURES = [
  { label: "Custom Username/Url", value: "No" },
  { label: "Contact list", value: "Limited" },
  { label: "Folder", value: "Limited" },
  { label: "Subsidiary company", value: "Limited" },
  { label: "Chamber", value: "Limited" },
];

export default function MembershipPage() {
  // USDT payment modal state
  const [usdtModalOpen, setUsdtModalOpen] = useState(false);
  const [usdtModalLoading, setUsdtModalLoading] = useState(false);
  const [usdtModalError, setUsdtModalError] = useState<string | null>(null);
  const [usdtTransactionId, setUsdtTransactionId] = useState("");
  const [usdtModalItem, setUsdtModalItem] = useState<any>(null); // stores the selected item for payment

  // USDT payment function
  const handleUsdtPayment = async () => {
    if (!usdtModalItem) return;
    setUsdtModalLoading(true);
    setUsdtModalError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/usdt/payment`,
        {
          membershiperiod: usdtModalItem.membershiperiod,
          usdt: usdtModalItem.usdt,
          transactionId: usdtTransactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.status === 200) {
        WebApp.showAlert(
          "USDT payment submitted! Our team will verify and update your membership soon."
        );
        setUsdtModalOpen(false);
        setUsdtTransactionId("");
        setUsdtModalItem(null);
      }
    } catch (err) {
      setUsdtModalError(
        typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object"
          ? (err as any).response?.data?.message ?? "Unknown error"
          : "Unknown error"
      );
    } finally {
      setUsdtModalLoading(false);
    }
  };
  const [telegramBtnLoading, setTelegramBtnLoading] = useState<string | null>(
    null
  ); // store item._id of loading button
  const profile = useProfileStore((state) => state.profile);
  const [showRenewBox, setShowRenewBox] = useState(false);
  const [renewHistory, setRenewHistory] = useState<any[] | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleRenewClick = async () => {
    setShowRenewBox((v) => !v);
    if (!showRenewBox && !renewHistory) {
      setRenewLoading(true);
      setRenewError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/membershiptenure`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRenewHistory(res.data.data || []);
      } catch (err: any) {
        setRenewError("Failed to load renewal tenure");
      } finally {
        setRenewLoading(false);
      }
    }
  };

  const handleTelegramCoinPayment = async (
    membershipPeriod: number,
    telegramCoin: number
  ) => {
    setTelegramBtnLoading(`${membershipPeriod}-${telegramCoin}`);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/telegram/payment`,
        {
          membershiperiod: membershipPeriod,
          telegramcoin: telegramCoin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);
      if (res.data?.invoice_link) {
        WebApp.openInvoice(res.data.invoice_link, (status) => {
          if (status === "paid") {
            //TODO: show some success message
            WebApp.showAlert(
              "Payment successful! Thank you. Your membership will be updated shortly."
            );
          } else if (status === "cancelled") {
            WebApp.showAlert("Payment was cancelled.");
          } else if (status === "failed") {
            WebApp.showAlert("Payment failed. Please try again.");
          }
        });
      } else {
        WebApp.showAlert("Failed to get Telegram payment link.");
      }
    } catch (err) {
      WebApp.showAlert(
        `${
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object"
            ? (err as any).response?.data?.message ?? "Unknown error"
            : "Unknown error"
        }`
      );
    } finally {
      setTelegramBtnLoading(null);
    }
  };

  if (!profile) {
    return (
      <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex justify-center items-center">
        <Header />
        <div className="flex-1 flex justify-center items-center text-red-500">
          Profile not loaded. Please refresh or visit your profile page first.
        </div>
        <Footer />
      </div>
    );
  }

  let formattedExpiry = "-";
  if (profile) {
    let expiryDate: Date;
    if (profile.enddate) {
      expiryDate = new Date(profile.enddate);
    } else {
      const join = new Date(profile.joindate);
      expiryDate = new Date(join);
      expiryDate.setFullYear(join.getFullYear() + 1);
    }
    formattedExpiry = expiryDate.toLocaleDateString("en-GB");
  }

  const isPremium = profile?.membertype === "premium";
  const features = isPremium ? PREMIUM_FEATURES : BASIC_FEATURES;

  return (
    <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-start flex-1 pb-32">
        <div className="w-full max-w-md mt-8 p-4 rounded-xl shadow-xl bg-white/90">
          <h2 className="text-2xl font-bold text-center text-[#2fa8e0] mb-4">
            {isPremium ? "Upgrade your membership" : "Your Membership"}
          </h2>
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div
              className={`bg-[#2fa8e0] text-white text-lg font-bold rounded-t-lg py-2 text-center mb-2`}
            >
              {isPremium ? "Premium Membership" : "Basic Membership"}
            </div>
            <table className="w-full text-sm mb-2">
              <tbody>
                {features.map((f) => (
                  <tr key={f.label} className="border-b last:border-b-0">
                    <td className="py-2 px-2 text-left font-medium">
                      {f.label}
                    </td>
                    <td className="py-2 px-2 text-right">{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="w-full bg-[#2fa8e0] text-white font-semibold py-2 rounded-b-lg mt-2 hover:bg-[#1b7bb8] transition"
              onClick={handleRenewClick}
            >
              Renew your membership
            </button>
          </div>
          <div className="text-center mt-4 text-lg font-semibold text-pink-700">
            {isPremium ? (
              <>
                Your Premium Membership is expiring on :{" "}
                <span className="font-bold">{formattedExpiry}</span>
              </>
            ) : (
              <>Upgrade to Premium for more features!</>
            )}
          </div>
        </div>
        {/* Renew Membership History Box */}
        {showRenewBox && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="text-lg font-bold text-[#2fa8e0] mb-2 text-center">
              Membership Renewal History
            </div>
            {renewLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : renewError ? (
              <div className="text-center text-red-500">{renewError}</div>
            ) : renewHistory && renewHistory.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Period (months)</th>
                    <th className="py-2 px-2 text-center">USDT</th>
                    <th className="py-2 px-2 text-center">Telegram Coin</th>
                  </tr>
                </thead>
                <tbody>
                  {renewHistory.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-2 px-2 text-left font-bold">
                        {item.membershiperiod ?? "NA"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          className="bg-[#2fa8e0] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#1b7bb8] transition"
                          onClick={() => {
                            setUsdtModalItem(item);
                            setUsdtModalOpen(true);
                          }}
                        >
                          {item.usdt ?? "NA"} USDT
                        </button>
                      </td>
                      {/* USDT Payment Modal */}
                      {usdtModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
                            <button
                              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                              onClick={() => {
                                setUsdtModalOpen(false);
                                setUsdtTransactionId("");
                                setUsdtModalItem(null);
                                setUsdtModalError(null);
                              }}
                              aria-label="Close"
                            >
                              &times;
                            </button>
                            <h3 className="text-lg font-bold text-[#2fa8e0] mb-4 text-center">
                              USDT Payment
                            </h3>
                            <div className="mb-2 text-sm text-gray-700">
                              <span className="font-semibold">Period:</span>{" "}
                              {usdtModalItem?.membershiperiod ?? "-"} month(s)
                            </div>
                            <div className="mb-2 text-sm text-gray-700">
                              <span className="font-semibold">USDT:</span>{" "}
                              {usdtModalItem?.usdt ?? "-"}
                            </div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Transaction ID
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#2fa8e0]"
                              value={usdtTransactionId}
                              onChange={(e) =>
                                setUsdtTransactionId(e.target.value)
                              }
                              placeholder="Enter your transaction ID"
                              disabled={usdtModalLoading}
                            />
                            {usdtModalError && (
                              <div className="text-red-500 text-sm mb-2">
                                {usdtModalError}
                              </div>
                            )}
                            <button
                              className="w-full bg-[#2fa8e0] text-white font-semibold py-2 rounded-lg mt-2 hover:bg-[#1b7bb8] transition disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={handleUsdtPayment}
                              disabled={usdtModalLoading || !usdtTransactionId}
                            >
                              {usdtModalLoading
                                ? "Submitting..."
                                : "Submit Payment"}
                            </button>
                          </div>
                        </div>
                      )}
                      <td className="py-2 px-2 text-center">
                        <button
                          className="bg-[#fbbf24] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#f59e1b] transition disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={
                            telegramBtnLoading ===
                            `${item.membershiperiod}-${item.telegramcoin}`
                          }
                          onClick={() =>
                            handleTelegramCoinPayment(
                              item.membershiperiod,
                              item.telegramcoin
                            )
                          }
                        >
                          {telegramBtnLoading ===
                          `${item.membershiperiod}-${item.telegramcoin}`
                            ? "Processing..."
                            : `${item.telegramcoin ?? "NA"} TG Coin`}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500">
                No membership renewal history found.
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
