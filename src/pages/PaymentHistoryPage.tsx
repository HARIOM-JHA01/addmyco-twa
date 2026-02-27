import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import WebApp from "@twa-dev/sdk";
import { useProfileStore } from "../store/profileStore";
import i18n from "../i18n";
import backgroundImg from "../assets/background.jpg";

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    fetchHistory();
  }, []);

  const profile = useProfileStore((state) => state.profile);
  const partnerUserName = (profile as any)?.partner?.username || null;

  return (
    <div
      className="bg-cover px-2 bg-center min-h-screen w-full overflow-x-hidden flex flex-col"
      style={{ backgroundImage: `var(--app-background-image, url(${backgroundImg}))` }}
    >
      <Header />
      <div className="flex flex-col items-center justify-start flex-1 pb-32">
        <div className="w-full max-w-md mt-8 p-4 rounded-xl shadow-xl bg-white/90">
          <div className="text-lg font-bold text-[#2fa8e0] mb-2 text-center">
            {i18n.t("payment_history")}
          </div>
          {partnerUserName && (
            <div className="px-2 mb-3">
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
                {i18n.t("renewed_by_partner")}{" "}
                <span
                  className="font-bold"
                  onClick={() => {
                    WebApp.openLink(`https://t.me/${partnerUserName}`);
                  }}
                >
                  {partnerUserName}
                </span>
              </div>
            </div>
          )}

          {historyLoading ? (
            <div className="text-center text-gray-500">
              {i18n.t("loading_history")}
            </div>
          ) : historyError ? (
            <div className="text-center text-red-500">{historyError}</div>
          ) : history && history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((h: any) => {
                // API: id, source, membership_id, amount, transactionId, status, date
                // status: 0 = usdt, else telegram coin
                const isUSDT = h.status === 0;
                const statusLabel = isUSDT ? "USDT" : "Telegram Coin";
                const statusColor = isUSDT
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700";
                return (
                  <li
                    key={h.id || h._id}
                    className="border rounded-xl p-4 bg-white flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(
                          h.date || h.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-semibold text-base">
                        {h.amount} {statusLabel}
                      </span>
                    </div>
                    {h.transactionId && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-600">
                          Transaction ID:{" "}
                          <span className="font-mono text-gray-800">
                            {h.transactionId}
                          </span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              {i18n.t("no_payment_history")}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
