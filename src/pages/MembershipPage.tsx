import { useProfileStore } from "../store/profileStore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import { QRCodeSVG } from "qrcode.react";
import i18n from "../i18n";

import walletTransferImage from "../assets/wallet-transfer.jpg";

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
    // Always use _id from membershiptenure API as membership_id
    const membership_id = usdtModalItem._id;
    if (!membership_id) {
      setUsdtModalError(
        "Membership ID is required for payment. Please select a valid membership option or contact support."
      );
      setUsdtModalLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Use membership_id and amount from the selected item, transactionId from user input
      const usdt = usdtModalItem.usdt || usdtModalItem.amount;
      const transactionId = usdtTransactionId;
      const res = await axios.post(
        `${API_BASE_URL}/usdt/payment`,
        {
          membershipId: membership_id, // always use _id
          usdt,
          transactionId,
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
        // fetch payment history as well when opening renew box
        fetchHistory();
      } catch (err: any) {
        setRenewError("Failed to load renewal tenure");
      } finally {
        setRenewLoading(false);
      }
    }
  };

  const handleTelegramCoinPayment = async (
    membershipPeriod: number,
    telegramCoin: number,
    membershipId: string,
    amount?: number
  ) => {
    setTelegramBtnLoading(`${membershipPeriod}-${telegramCoin}`);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/telegram/payment`,
        {
          membership_id: membershipId, // always use _id
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
      if (res.data?.invoice_link) {
        WebApp.openInvoice(res.data.invoice_link, (status: string) => {
          if (status === "paid") {
            (async () => {
              try {
                // Use membershipId and amount from the selected item, transactionId from res.data if available
                const membership_id =
                  membershipId ||
                  res.data?.membership_id ||
                  res.data?._id ||
                  "";
                const amountValue = amount || res.data?.amount || telegramCoin;
                const transactionId =
                  res.data?.transaction_id || "TELEGRAM_TX_ID";
                await axios.post(
                  `${API_BASE_URL}/telegram/payment/complete`,
                  {
                    membership_id,
                    amount: amountValue,
                    transactionId,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                WebApp.showAlert(
                  "Payment successful! Thank you. Your membership will be updated shortly."
                );
              } catch (e) {
                WebApp.showAlert(
                  "Payment succeeded, but failed to notify server. Please contact support if your membership is not updated."
                );
              }
            })();
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

  // Membership payment history
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/membership/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.data || []);
    } catch (err: any) {
      setHistoryError("Failed to load membership history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-start flex-1 pb-32">
        <div className="w-full max-w-md mt-8 p-4 rounded-xl shadow-xl bg-white/90">
          <h2 className="text-2xl font-bold text-center text-[#2fa8e0] mb-4">
            {isPremium
              ? i18n.t("upgrade_membership")
              : i18n.t("your_membership")}
          </h2>
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div
              className={`bg-[#2fa8e0] text-white text-lg font-bold rounded-t-lg py-2 text-center mb-2`}
            >
              {isPremium
                ? i18n.t("premium_membership")
                : i18n.t("basic_membership")}
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
              {i18n.t("renew_membership")}
            </button>
          </div>
          <div className="text-center mt-4 text-lg font-semibold text-pink-700">
            {isPremium ? (
              <>
                {i18n.t("premium_expiring")}{" "}
                <span className="font-bold">{formattedExpiry}</span>
              </>
            ) : (
              <>{i18n.t("upgrade_to_premium")}</>
            )}
          </div>
        </div>
        {/* Membership History (below upgrade box) */}
        <div className="w-full max-w-md mt-4 p-4 rounded-xl shadow-xl bg-white/90">
          <div className="text-lg font-bold text-[#2fa8e0] mb-2 text-center">
            {i18n.t("payment_history")}
          </div>
          {historyLoading ? (
            <div className="text-center text-gray-500">
              {i18n.t("loading_history")}
            </div>
          ) : historyError ? (
            <div className="text-center text-red-500">{historyError}</div>
          ) : history && history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((h: any) => (
                <li key={h._id} className="border rounded-lg p-3 bg-white">
                  <div className="text-sm text-gray-600">
                    {i18n.t("date_label")}{" "}
                    {new Date(
                      h.date || h.createdAt || Date.now()
                    ).toLocaleString()}
                  </div>
                  <div className="font-semibold">
                    {i18n.t("amount_label")} {h.amount ?? h.usdt ?? "NA"}
                  </div>
                  <div className="text-sm text-gray-700">
                    {i18n.t("status_label")}{" "}
                    {h.status ?? h.payment_status ?? "Unknown"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              {i18n.t("no_payment_history")}
            </div>
          )}
        </div>
        {/* Renew Membership History Box */}
        {showRenewBox && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="text-lg font-bold text-[#2fa8e0] mb-2 text-center">
              {i18n.t("membership_renewal")}
            </div>
            <div className="text-center font-semibold text-black mb-4">
              {i18n.t("upgrade_membership")}
            </div>
            {renewLoading ? (
              <div className="text-center text-gray-500">
                {i18n.t("loading")}
              </div>
            ) : renewError ? (
              <div className="text-center text-red-500">{renewError}</div>
            ) : renewHistory && renewHistory.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-center">
                      {i18n.t("membership_tenure")}
                    </th>
                    <th className="py-2 px-2 text-center">
                      {i18n.t("usdt_label")}
                    </th>
                    <th className="py-2 px-2 text-center">
                      {i18n.t("telegram_coin")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renewHistory.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-2 px-2 text-left font-bold">
                        {item.membershiperiod != null
                          ? item.membershiperiod + " " + i18n.t("years_label")
                          : "NA"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          className="group relative flex flex-col items-center justify-center px-5 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-[#2fa8e0] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#2fa8e0] transition text-white text-base focus:outline-none focus:ring-2 focus:ring-[#2fa8e0] focus:ring-offset-2"
                          style={{ minWidth: 120 }}
                          onClick={() => {
                            setUsdtModalItem(item);
                            setUsdtModalOpen(true);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6 text-white drop-shadow"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v18m9-9H3"
                              />
                            </svg>
                            <span>{item.usdt ?? "NA"} USDT</span>
                          </span>
                          <span className="text-xs font-normal mt-1 opacity-80">
                            {i18n.t("pay_with_usdt")}
                          </span>
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-white rounded-full group-hover:w-3/4 transition-all duration-300"></span>
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
                              {i18n.t("usdt_payment")}
                            </h3>
                            <div className="flex flex-col items-center gap-3 mb-4">
                              <img
                                src={walletTransferImage}
                                alt="Wallet Transfer"
                                className="rounded-lg max-h-32 object-contain"
                              />
                              <p className="text-sm font-medium break-all bg-gray-100 p-4 rounded-lg text-center">
                                {i18n.t("copy_wallet_address")}
                                <br />
                                <span
                                  className="text-blue-600 cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(
                                        "TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz"
                                      );
                                      WebApp.showAlert(
                                        i18n.t("wallet_address_copied")
                                      );
                                    } catch (e) {
                                      WebApp.showAlert(
                                        i18n.t("wallet_copy_failed")
                                      );
                                    }
                                  }}
                                >
                                  TK2TMn99SBCrdbZpSef7rFE3vTccvR6dCz
                                </span>
                              </p>
                            </div>
                            <div className="mb-2 text-sm text-gray-700">
                              <span className="font-semibold">
                                {i18n.t("period_label")}
                              </span>{" "}
                              {usdtModalItem?.membershiperiod ?? "-"}{" "}
                              {i18n.t("years_label")}
                            </div>
                            <div className="mb-2 text-sm text-gray-700">
                              <span className="font-semibold">
                                {i18n.t("usdt_label")}
                              </span>{" "}
                              {usdtModalItem?.usdt ?? "-"}
                            </div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              {i18n.t("transaction_id_label")}
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#2fa8e0]"
                              value={usdtTransactionId}
                              onChange={(e) =>
                                setUsdtTransactionId(e.target.value)
                              }
                              placeholder={i18n.t("transaction_id_placeholder")}
                              disabled={usdtModalLoading}
                            />
                            {usdtModalError && (
                              <div className="text-red-500 text-sm mb-2">
                                {usdtModalError}
                              </div>
                            )}
                            <button
                              className="w-full bg-gradient-to-r from-[#2fa8e0] to-[#38bdf8] text-white font-semibold py-2 rounded-lg mt-2 hover:from-[#38bdf8] hover:to-[#2fa8e0] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                              onClick={handleUsdtPayment}
                              disabled={usdtModalLoading || !usdtTransactionId}
                            >
                              {usdtModalLoading
                                ? i18n.t("submitting")
                                : i18n.t("submit_payment")}
                            </button>
                          </div>
                        </div>
                      )}
                      <td className="py-2 px-2 text-center">
                        <button
                          className="group relative flex flex-col items-center justify-center px-5 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-[#fbbf24] to-[#f59e1b] hover:from-[#f59e1b] hover:to-[#fbbf24] transition text-white text-base focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ minWidth: 120 }}
                          disabled={
                            telegramBtnLoading ===
                            `${item.membershiperiod}-${item.telegramcoin}`
                          }
                          onClick={() =>
                            handleTelegramCoinPayment(
                              item.membershiperiod,
                              item.telegramcoin,
                              item._id,
                              item.usdt // or item.amount if that's the correct field
                            )
                          }
                        >
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6 text-white drop-shadow"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v18m9-9H3"
                              />
                            </svg>
                            <span>{item.telegramcoin ?? "NA"} TG Coin</span>
                          </span>
                          <span className="text-xs font-normal mt-1 opacity-80">
                            {i18n.t("pay_with_telegram_coin")}
                          </span>
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-white rounded-full group-hover:w-3/4 transition-all duration-300"></span>
                          {telegramBtnLoading ===
                          `${item.membershiperiod}-${item.telegramcoin}` ? (
                            <span className="ml-2 animate-pulse">
                              {i18n.t("processing")}
                            </span>
                          ) : null}
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
