import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import i18n from "../i18n";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BackgroundPage() {
  const [systemImages, setSystemImages] = useState<any[]>([]);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const [sysRes, userRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/system`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/getimage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/categorylist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSystemImages(sysRes.data.data || []);
        setUserImages(userRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch (err: any) {
        setError("Failed to load background images or categories");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filtered lists for search
  const filteredSystem = systemImages.filter((img) => {
    if (!search) return true;
    return (
      (img.source || "").toLowerCase().includes(search.toLowerCase()) ||
      String(img.amount || "").includes(search) ||
      String(img.transactionId || "").includes(search)
    );
  });
  const filteredUser = userImages.filter((img) => {
    if (!search) return true;
    return (
      (img.source || "").toLowerCase().includes(search.toLowerCase()) ||
      String(img.amount || "").includes(search) ||
      String(img.transactionId || "").includes(search)
    );
  });
  const filteredCategories = categories.filter((cat) => {
    if (!search) return true;
    return (
      (cat.source || "").toLowerCase().includes(search.toLowerCase()) ||
      String(cat.amount || "").includes(search) ||
      String(cat.transactionId || "").includes(search)
    );
  });

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-screen py-4 px-2 bg-blue-200 bg-opacity-20">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {i18n.t("background_images")}
          </h2>
          {/* Search box */}
          <div className="relative mb-4">
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 pr-10 w-full bg-white placeholder-gray-500"
              placeholder={i18n.t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          {loading ? (
            <div className="text-gray-500">{i18n.t("loading")}</div>
          ) : error ? (
            <div className="text-red-500">
              {i18n.t("failed_load_background")}
            </div>
          ) : (
            <>
              {/* System Images Row */}
              <div className="w-full mb-4">
                <h3 className="font-bold text-lg mb-2 text-app">
                  {i18n.t("system_images")}
                </h3>
                <div className="overflow-x-auto scrollbar-custom">
                  <div className="flex gap-4 min-w-max px-2 mb-2">
                    {filteredSystem.length === 0 ? (
                      <div className="text-gray-400">
                        {i18n.t("no_system_images")}
                      </div>
                    ) : (
                      filteredSystem.map((img: any) => (
                        <div
                          key={img.id}
                          className="flex flex-col items-center bg-white rounded-lg border p-2 min-w-[110px]"
                        >
                          <span className="font-bold text-xs text-gray-700 mb-1">
                            {img.source === "usdt" ? "USDT" : "Telegram Coin"}
                          </span>
                          <span className="text-base font-semibold text-blue-700">
                            {img.amount}
                          </span>
                          <span className="text-xs text-gray-500">
                            {img.date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* User Images Row */}
              <div className="w-full mb-4">
                <h3 className="font-bold text-lg mb-2 text-app">
                  {i18n.t("your_images")}
                </h3>
                <div className="overflow-x-auto scrollbar-custom">
                  <div className="flex gap-4 min-w-max px-2 mb-2">
                    {filteredUser.length === 0 ? (
                      <div className="text-gray-400">
                        {i18n.t("no_user_images")}
                      </div>
                    ) : (
                      filteredUser.map((img: any) => (
                        <div
                          key={img.id}
                          className="flex flex-col items-center bg-white rounded-lg border p-2 min-w-[110px]"
                        >
                          <span className="font-bold text-xs text-gray-700 mb-1">
                            {img.source === "usdt" ? "USDT" : "Telegram Coin"}
                          </span>
                          <span className="text-base font-semibold text-blue-700">
                            {img.amount}
                          </span>
                          <span className="text-xs text-gray-500">
                            {img.date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* Categories List */}
              <div className="w-full mb-2">
                <h3 className="font-bold text-lg mb-2 text-app">
                  {i18n.t("categories")}
                </h3>
                <ul className="list-disc pl-5">
                  {filteredCategories.length === 0 ? (
                    <li className="text-gray-400">{i18n.t("no_categories")}</li>
                  ) : (
                    filteredCategories.map((cat: any, idx: number) => (
                      <li
                        key={cat.id || idx}
                        className="text-gray-700 flex flex-col gap-1 mb-2"
                      >
                        <span className="font-bold text-xs text-gray-700">
                          {cat.source === "usdt" ? "USDT" : "Telegram Coin"}
                        </span>
                        <span className="text-base font-semibold text-blue-700">
                          {cat.amount}
                        </span>
                        <span className="text-xs text-gray-500">
                          {cat.date}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
