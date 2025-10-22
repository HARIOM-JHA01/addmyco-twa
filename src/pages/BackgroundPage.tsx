import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useProfileStore } from "../store/profileStore";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
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
        // Normalize system images: API uses `Thumbnail` (array) and `categoryname` fields
        const rawSystem = sysRes?.data?.data || [];
        const normalizedSystem = rawSystem.map((it: any) => {
          const thumbnails = it.Thumbnail || it.thumbnail || it.Thumbnail || [];
          const primary = Array.isArray(thumbnails)
            ? thumbnails[0]
            : thumbnails;
          return {
            ...it,
            _id: it._id,
            // keep original Thumbnail array
            thumbnails: Array.isArray(thumbnails)
              ? thumbnails
              : thumbnails
              ? [thumbnails]
              : [],
            // primary url convenient field
            url:
              primary ||
              it.url ||
              it.image ||
              it.imgUrl ||
              it.src ||
              it.thumbnail,
            // category id/name from API (some items have categoryname string or category array)
            categoryId:
              it.categoryname ||
              (it.category && it.category[0] && it.category[0]._id) ||
              null,
            categoryName:
              (it.category && it.category[0] && it.category[0].categoryname) ||
              it.categoryname ||
              null,
          };
        });
        setSystemImages(normalizedSystem || []);
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
      key: c.slug || c._id || c.id || c.categoryname || String(Math.random()),
      label: c.categoryname || c.name || c.label || c.slug || "Category",
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
        c.name === activeTab ||
        c.categoryname === activeTab
    );
    // Filter systemImages by category if possible
    if (cat && systemImages.length > 0) {
      // Filter normalized system images by category id or categoryName
      const catKey = cat.slug || cat._id || cat.id || cat.name;
      return systemImages.filter((img: any) => {
        return (
          img.categoryId === catKey ||
          img.categoryId === cat._id ||
          img.categoryId === cat.id ||
          img.categoryName === cat.name ||
          img.categoryName === cat.label ||
          img.categoryName === cat.categoryname
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

  // membership check - free users can't upload
  const profile = useProfileStore((s) => s.profile);
  const memberType = profile?.membertype || profile?.membertype || "free";
  const isFree =
    memberType === "free" || memberType === "Free" || memberType === "FREE";

  return (
    <Layout>
      <div className="bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col">
        <div className="px-2 pt-3 pb-28 flex-1 flex justify-center">
          <div className="w-full max-w-[880px] bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md">
            {/* Category buttons with upload button - styled scrollbar matching ContactPage */}
            <div className="mt-4 overflow-x-auto scrollbar-custom">
              <div className="flex gap-4 min-w-max px-2 mb-4">
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <div key={t.key} className="flex items-center w-30">
                      <button
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        className={`flex justify-between items-center w-full px-4 py-1 rounded-sm ${
                          isActive
                            ? "bg-[var(--app-background-color,#0099cc)] text-white"
                            : "bg-white text-gray-700"
                        }`}
                        onMouseEnter={(e) => {
                          if (isActive) return;
                          const el = e.currentTarget as HTMLElement;
                          el.style.backgroundColor = (
                            getComputedStyle(
                              document.documentElement
                            ).getPropertyValue("--app-background-color") ||
                            "#007cb6"
                          ).trim();
                          el.style.color = (
                            getComputedStyle(
                              document.documentElement
                            ).getPropertyValue("--app-font-color") || "#ffffff"
                          ).trim();
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          if (isActive) return;
                          el.style.backgroundColor = "white";
                          el.style.color = "#374151";
                        }}
                      >
                        <span className="text-left w-full truncate">
                          {t.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
                {/* Upload button inline with categories */}
                <div className="flex items-center">
                  <button
                    className={`px-4 py-1 rounded-sm font-bold text-white whitespace-nowrap ${
                      isFree ? "bg-gray-400 cursor-not-allowed" : ""
                    }`}
                    style={{ background: isFree ? "#9ca3af" : "#ff007a" }}
                    onClick={() => {
                      if (isFree) {
                        alert(
                          "Upload is available for premium users only. Please upgrade to upload your background images."
                        );
                        return;
                      }
                      handleUploadClick();
                    }}
                    disabled={isFree}
                  >
                    Upload your Image
                  </button>
                  <input
                    type="file"
                    ref={uploadInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (isFree) return;
                      handleUploadChange(e);
                    }}
                  />
                </div>
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
                    // Use the normalized url or fallback to thumbnails
                    const url =
                      img.url ||
                      (Array.isArray(img.thumbnails) && img.thumbnails[0]) ||
                      null;
                    const isSelected = selectedImage === url;
                    return (
                      <button
                        key={img.id || img._id || idx}
                        className="relative w-full pt-[60%] rounded-lg overflow-hidden shadow-md bg-white/70"
                        onClick={() => {
                          setModalImage(img);
                          setModalError(null);
                          setModalSuccess(null);
                          setModalOpen(true);
                        }}
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
            {/* Fullscreen modal for preview + set background */}
            {modalOpen && modalImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={() => setModalOpen(false)}
              >
                <div
                  className="bg-white rounded-lg overflow-hidden max-w-[95vw] max-h-[95vh] w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full h-[70vh] bg-black">
                    <img
                      src={
                        modalImage.url ||
                        (Array.isArray(modalImage.thumbnails) &&
                          modalImage.thumbnails[0])
                      }
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1"
                      onClick={() => setModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {modalError && (
                      <div className="text-red-600">{modalError}</div>
                    )}
                    {modalSuccess && (
                      <div className="text-green-600">{modalSuccess}</div>
                    )}
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold"
                        disabled={modalLoading}
                        onClick={async () => {
                          // call the POST API to set background
                          setModalLoading(true);
                          setModalError(null);
                          try {
                            const token = localStorage.getItem("token");
                            if (!token)
                              throw new Error("No token found. Please login.");
                            const thumb =
                              modalImage.url ||
                              (Array.isArray(modalImage.thumbnails) &&
                                modalImage.thumbnails[0]);
                            await axios.post(
                              `${API_BASE_URL}/backgroundimage`,
                              { Thumbnail: thumb },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            // apply locally and close
                            setSelectedImage(thumb);
                            setModalSuccess("Background set successfully");
                            // notify app
                            window.dispatchEvent(
                              new Event("background-updated")
                            );
                            setTimeout(() => {
                              setModalOpen(false);
                              setModalSuccess(null);
                            }, 900);
                          } catch (err: any) {
                            setModalError(
                              err?.response?.data?.message ||
                                err.message ||
                                "Failed to set background"
                            );
                          } finally {
                            setModalLoading(false);
                          }
                        }}
                      >
                        {modalLoading ? "Setting..." : "Set as background"}
                      </button>
                      <button
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold"
                        onClick={() => {
                          setModalOpen(false);
                        }}
                        disabled={modalLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
