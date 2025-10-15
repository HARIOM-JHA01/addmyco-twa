import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import WebApp from "@twa-dev/sdk";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BackgroundPage() {
  const [systemImages, setSystemImages] = useState<any[]>([]);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start min-h-screen py-4 px-2 bg-blue-200 bg-opacity-20">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Background Images</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {/* System Images Row */}
              <div className="w-full mb-4">
                <h3 className="font-bold text-lg mb-2 text-[#007cb6]">
                  System Images
                </h3>
                <div className="overflow-x-auto scrollbar-custom">
                  <div className="flex gap-4 min-w-max px-2 mb-2">
                    {systemImages.length === 0 ? (
                      <div className="text-gray-400">No system images</div>
                    ) : (
                      systemImages.map((img: any) => (
                        <img
                          key={img._id || img.url}
                          src={img.url || img}
                          alt="System"
                          className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                          onClick={() => WebApp.showAlert("Work in progress")}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* User Images Row */}
              <div className="w-full mb-4">
                <h3 className="font-bold text-lg mb-2 text-[#007cb6]">
                  Your Images
                </h3>
                <div className="overflow-x-auto scrollbar-custom">
                  <div className="flex gap-4 min-w-max px-2 mb-2">
                    {userImages.length === 0 ? (
                      <div className="text-gray-400">No user images</div>
                    ) : (
                      userImages.map((img: any) => (
                        <img
                          key={img._id || img.url}
                          src={img.url || img}
                          alt="User"
                          className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                          onClick={() => WebApp.showAlert("Work in progress")}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* Categories List */}
              <div className="w-full mb-2">
                <h3 className="font-bold text-lg mb-2 text-[#007cb6]">
                  Categories
                </h3>
                <ul className="list-disc pl-5">
                  {categories.length === 0 ? (
                    <li className="text-gray-400">No categories</li>
                  ) : (
                    categories.map((cat: any) => (
                      <li key={cat._id || cat.name} className="text-gray-700">
                        {cat.name || cat}
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
