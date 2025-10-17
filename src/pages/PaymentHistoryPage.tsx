import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import i18n from "../i18n";

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

  return (
    <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-start flex-1 pb-32">
        <div className="w-full max-w-md mt-8 p-4 rounded-xl shadow-xl bg-white/90">
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
      </div>
      <Footer />
    </div>
  );
}
