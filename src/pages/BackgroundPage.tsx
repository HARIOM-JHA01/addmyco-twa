import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import i18n from "../i18n";
// Removed unused search icon after refactor

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BackgroundPage() {
  // Data sources
  const [systemImages, setSystemImages] = useState<any[]>([]);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state matching screenshot
  const [activeTab, setActiveTab] = useState<string>("system"); // system category slug or 'my'
  // Category key is tracked via activeTab; no separate state required
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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

  // Build tabs similar to screenshot: dynamic categories + My images
  // Tabs: show actual category names from API, plus 'Your Images'
  const tabs = useMemo(() => {
    const catTabs = (categories || []).map((c: any) => ({
      key: c.slug || c._id || c.id || c.name || String(Math.random()),
      label: c.name || c.label || c.slug || "Category",
      type: "category" as const,
      payload: c,
    }));
    return [
      ...catTabs,
      {
        key: "my",
        label: i18n.t("your_images") || "Your Images",
        type: "my" as const,
      },
    ];
  }, [categories]);

  // Images for the active tab (mock: use systemImages for categories, userImages for my)
  // Show images for the selected category, or user's images for 'my'
  const imagesForTab = useMemo(() => {
    if (activeTab === "my") return userImages;
    // Find the selected category object
    const cat = categories.find(
      (c: any) =>
        c.slug === activeTab ||
        c._id === activeTab ||
        c.id === activeTab ||
        c.name === activeTab
    );
    // Filter systemImages by category if possible
    if (cat && systemImages.length > 0) {
      // Try to match images with a category field (category, categoryId, etc.)
      const catKey = cat.slug || cat._id || cat.id || cat.name;
      // Try common fields: category, categoryId, category_id, etc.
      return systemImages.filter((img: any) => {
        return (
          img.category === catKey ||
          img.categoryId === catKey ||
          img.category_id === catKey ||
          img.category === cat.name ||
          img.categoryId === cat._id ||
          img.categoryId === cat.id
        );
      });
    }
    // fallback: show all system images
    return systemImages;
  }, [activeTab, categories, systemImages, userImages]);

  // Scroll progress handler
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const prog = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      setScrollProgress(prog);
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [gridRef, imagesForTab]);

  // Apply selected background as preview
  useEffect(() => {
    if (!selectedImage) return;
    document.body.style.backgroundImage = `url(${selectedImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    // notify app to refetch/apply if needed
    window.dispatchEvent(new Event("background-updated"));
  }, [selectedImage]);

  const handleUploadClick = () => uploadInputRef.current?.click();
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Preview locally and select it immediately
      const url = reader.result as string;
      setSelectedImage(url);
      // TODO: POST to upload endpoint if available
      // axios.post(`${API_BASE_URL}/uploadBackground`, formData, { headers })
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col">
        <div className="px-2 pt-3 pb-28 flex-1 flex justify-center">
          <div className="w-full max-w-[880px] bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md">
            {/* Top row: tabs + upload button */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`px-5 py-2 rounded-full font-semibold shadow-sm ${
                        isActive ? "text-white" : "text-gray-700"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? "var(--app-background-color, #0099cc)"
                          : "white",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-white"
                  style={{ background: "#ff007a" }}
                  onClick={handleUploadClick}
                >
                  Upload your Image
                </button>
                <input
                  type="file"
                  ref={uploadInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadChange}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/70 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(scrollProgress * 100)}%`,
                  background: "var(--app-background-color, #007cb6)",
                  transition: "width 150ms linear",
                }}
              />
            </div>

            {/* Image grid */}
            {loading ? (
              <div className="text-white/90">{i18n.t("loading")}</div>
            ) : error ? (
              <div className="text-red-600 bg-white/70 rounded p-2 inline-block">
                {i18n.t("failed_load_background")}
              </div>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto pr-1"
              >
                {imagesForTab.length === 0 ? (
                  <div className="col-span-full text-white/90">
                    {activeTab === "my"
                      ? i18n.t("no_user_images")
                      : i18n.t("no_system_images")}
                  </div>
                ) : (
                  imagesForTab.map((img: any, idx: number) => {
                    // Use the correct image URL field from API
                    const url =
                      img.url ||
                      img.image ||
                      img.imgUrl ||
                      img.src ||
                      img.thumbnail;
                    const isSelected = selectedImage === url;
                    return (
                      <button
                        key={img.id || img._id || idx}
                        className="relative w-full pt-[60%] rounded-lg overflow-hidden shadow-md bg-white/70"
                        onClick={() => url && setSelectedImage(url)}
                        style={{
                          outline: isSelected
                            ? "3px solid var(--app-background-color, #00a3d7)"
                            : "none",
                        }}
                        aria-label="Select background"
                        disabled={!url}
                      >
                        {url ? (
                          <img
                            src={url}
                            alt="bg"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            No image
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
