import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useProfileStore } from "../store/profileStore";
import Layout from "../components/Layout";
import i18n from "../i18n";
import backgroundImg from "../assets/background.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BackgroundPage() {
  const [systemImages, setSystemImages] = useState<any[]>([]);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const profile = useProfileStore((s) => s.profile);
  const memberType = profile?.membertype || profile?.membertype || "free";
  const isLifetimeUser = profile?.usertype === 2;
  const isFree =
    (memberType === "free" || memberType === "Free" || memberType === "FREE") &&
    !isLifetimeUser;

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
        const rawSystem = sysRes?.data?.data || [];
        const normalizedSystem = rawSystem.map((it: any) => {
          // Handle both Thumbnail (system images) and fileUrl (user-uploaded images)
          const thumbnails = it.Thumbnail || it.thumbnail || it.fileUrl || [];
          const primary = Array.isArray(thumbnails)
            ? thumbnails[0]
            : thumbnails;
          return {
            ...it,
            _id: it._id,
            thumbnails: Array.isArray(thumbnails)
              ? thumbnails
              : thumbnails
                ? [thumbnails]
                : [],
            url:
              primary ||
              it.url ||
              it.image ||
              it.imgUrl ||
              it.src ||
              it.thumbnail,
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

        // Normalize user images - fetch from fileUrl array
        const rawUser = userRes?.data?.data || [];
        const normalizedUser = rawUser.map((it: any, idx: number) => {
          const fileUrls = it.fileUrl || [];
          const primaryUrl =
            Array.isArray(fileUrls) && fileUrls.length > 0
              ? fileUrls[0]
              : it.url || it.image || it.imgUrl || it.src;

          const normalized = {
            ...it,
            _id: it._id || `user-img-${idx}`,
            url: primaryUrl,
            thumbnails:
              Array.isArray(fileUrls) && fileUrls.length > 0
                ? fileUrls
                : primaryUrl
                  ? [primaryUrl]
                  : [],
            uniqueKey: it._id || `user-img-${idx}`,
          };

          // Debug log to check if images are being normalized properly
          console.log("Normalized user image:", normalized);

          return normalized;
        });

        setSystemImages(normalizedSystem || []);
        setUserImages(normalizedUser || []);
        setCategories(catRes.data.data || []);

        // Debug logs
        console.log("API Response - Raw user images:", rawUser);
        console.log("Normalized user images:", normalizedUser);
        console.log("Total user images:", normalizedUser.length);
      } catch (err: any) {
        setError("Failed to load background images or categories");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs = useMemo(() => {
    const catTabs = (categories || []).map((c: any) => ({
      key: c.slug || c._id || c.id || c.categoryname || String(Math.random()),
      label: c.categoryname || c.name || c.label || c.slug || "Category",
      type: "category" as const,
      payload: c,
    }));

    const allTab = {
      key: "all",
      label: i18n.t("all") || "All",
      type: "all" as const,
    };

    const myTab = {
      key: "my",
      label: i18n.t("your_images") || "Your Images",
      type: "my" as const,
    };

    if (isFree) {
      return [allTab, ...catTabs];
    }

    return [allTab, ...catTabs, myTab];
  }, [categories, isFree]);

  const imagesForTab = useMemo(() => {
    const expandThumbnails = (images: any[]) => {
      const expanded: any[] = [];
      images.forEach((img: any) => {
        const thumbnails = img.thumbnails || [];
        if (thumbnails.length > 0) {
          thumbnails.forEach((thumbUrl: string, index: number) => {
            expanded.push({
              ...img,
              url: thumbUrl,
              thumbnailIndex: index,
              uniqueKey: `${img._id}-thumb-${index}`,
            });
          });
        } else {
          expanded.push(img);
        }
      });
      return expanded;
    };

    if (activeTab === "my") {
      if (isFree) return [];

      const yourImagesFromSystem = (systemImages || []).filter((img: any) => {
        const catRaw = (
          img.categoryname ||
          img.categoryName ||
          (img.category && img.category[0] && img.category[0].categoryname) ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        return catRaw === "your-images" || catRaw === "your images";
      });

      const combined = [...(userImages || []), ...yourImagesFromSystem];
      const expanded = expandThumbnails(combined);

      // Debug log for "my" tab
      console.log("My tab - userImages:", userImages);
      console.log("My tab - yourImagesFromSystem:", yourImagesFromSystem);
      console.log("My tab - combined:", combined);
      console.log("My tab - expanded:", expanded);

      return expanded;
    }

    if (activeTab === "all") {
      return expandThumbnails(systemImages);
    }

    const cat = categories.find(
      (c: any) =>
        c.slug === activeTab ||
        c._id === activeTab ||
        c.id === activeTab ||
        c.name === activeTab ||
        c.categoryname === activeTab,
    );

    if (cat && systemImages.length > 0) {
      const catKey = cat.slug || cat._id || cat.id || cat.name;
      const filtered = systemImages.filter((img: any) => {
        return (
          img.categoryId === catKey ||
          img.categoryId === cat._id ||
          img.categoryId === cat.id ||
          img.categoryName === cat.name ||
          img.categoryName === cat.label ||
          img.categoryName === cat.categoryname
        );
      });
      return expandThumbnails(filtered);
    }

    return expandThumbnails(systemImages);
  }, [activeTab, categories, systemImages, userImages, isFree]);

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

  useEffect(() => {
    if (!selectedImage) return;
    document.body.style.backgroundImage = `url(${selectedImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    window.dispatchEvent(new Event("background-updated"));
  }, [selectedImage]);

  const handleUploadClick = () => uploadInputRef.current?.click();
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFree) return;
    const file = e.target.files?.[0];
    if (!file) {
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;

      const localImg = {
        _id: `local-${Date.now()}`,
        url,
        thumbnails: [url],
        uniqueKey: `local-${Date.now()}`,
        __file: file,
      } as any;

      setUserImages((prev) => [localImg, ...(prev || [])]);
      setActiveTab("my");
      setModalImage(localImg);
      setModalOpen(true);
      setModalError(null);
      setModalSuccess(null);
      setUploadProgress(null);

      if (uploadInputRef.current) uploadInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImageToServer = async () => {
    if (!modalImage || !modalImage.__file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setModalError("Not authenticated. Please login.");
      return;
    }

    try {
      setUploadProgress(0);
      const form = new FormData();
      form.append("file", modalImage.__file);

      const res = await axios.post(`${API_BASE_URL}/uploadBackground`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(Math.min(100, Math.round(pct)));
          }
        },
      });

      const serverData = res?.data?.data || res?.data || null;
      if (!serverData) {
        throw new Error("Invalid server response");
      }

      const serverImg = {
        _id: serverData._id || serverData.id || `uploaded-${Date.now()}`,
        url:
          serverData.url ||
          serverData.image ||
          serverData.thumbnail ||
          serverData.src ||
          modalImage.url,
        thumbnails:
          serverData.thumbnails ||
          (serverData.url ? [serverData.url] : modalImage.thumbnails),
        uniqueKey: serverData._id || `uploaded-${Date.now()}`,
        ...serverData,
      } as any;

      setUserImages((prev) => {
        const filtered = (prev || []).filter(
          (i: any) => i.uniqueKey !== modalImage.uniqueKey,
        );
        return [serverImg, ...filtered];
      });

      setModalImage(serverImg);
      setModalSuccess("Image uploaded successfully");
      setUploadProgress(null);
    } catch (err: any) {
      console.error("Upload failed", err);
      setModalError(
        err?.response?.data?.message || err.message || "Upload failed",
      );
      setUploadProgress(null);
    }
  };

  const handleSetBackgroundImage = async () => {
    setModalLoading(true);
    setModalError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login.");
      }

      const imageUrl =
        modalImage.url ||
        (Array.isArray(modalImage.thumbnails) && modalImage.thumbnails[0]);

      if (!imageUrl) {
        throw new Error("No image URL found");
      }

      await axios.post(
        `${API_BASE_URL}/backgroundimage`,
        { Thumbnail: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSelectedImage(imageUrl);
      setModalSuccess("Background set successfully");

      window.dispatchEvent(new Event("background-updated"));

      setTimeout(() => {
        setModalOpen(false);
        setModalSuccess(null);
      }, 900);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to set background",
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Layout>
      <div
        className="bg-cover bg-center min-h-screen w-full overflow-x-hidden flex flex-col"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >
        <div className="px-2 pt-3 pb-28 flex-1 flex justify-center">
          <div className="w-full max-w-[880px] bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md">
            <div className="mt-4 overflow-x-auto scrollbar-custom">
              <div className="flex gap-4 min-w-max px-2 mb-4">
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <div key={t.key} className="flex items-center w-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          setActiveTab(t.key);
                          const el = e.currentTarget as HTMLElement;
                          el.style.backgroundColor = "";
                          el.style.color = "";
                        }}
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
                              document.documentElement,
                            ).getPropertyValue("--app-background-color") ||
                            "#007cb6"
                          ).trim();
                          el.style.color = (
                            getComputedStyle(
                              document.documentElement,
                            ).getPropertyValue("--app-font-color") || "#ffffff"
                          ).trim();
                        }}
                        onMouseLeave={(e) => {
                          if (isActive) return;
                          const el = e.currentTarget as HTMLElement;
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
                <div className="flex items-center">
                  <button
                    className={`px-4 py-1 rounded-sm font-bold text-white whitespace-nowrap ${
                      isFree ? "bg-gray-400 cursor-not-allowed" : ""
                    }`}
                    style={{ background: isFree ? "#9ca3af" : "#ff007a" }}
                    onClick={() => {
                      if (isFree) {
                        alert(
                          "Upload is available for premium users only. Please upgrade to upload your background images.",
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
                    const url =
                      img.url ||
                      (Array.isArray(img.thumbnails) && img.thumbnails[0]) ||
                      null;
                    const isSelected = selectedImage === url;

                    // Debug log for "my" tab images
                    if (activeTab === "my") {
                      console.log("Rendering 'my' tab image:", {
                        img,
                        url,
                        hasUrl: !!url,
                      });
                    }

                    return (
                      <button
                        key={img.uniqueKey || img.id || img._id || idx}
                        className="relative w-full pt-[150%] rounded-lg overflow-hidden shadow-md bg-white/70"
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
                            onError={(e) => {
                              console.error("Image failed to load:", url);
                              if (activeTab === "my") {
                                console.log(
                                  "Image load error for user image:",
                                  url,
                                );
                              }
                            }}
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
            {modalOpen && modalImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
                onClick={() => setModalOpen(false)}
              >
                <div
                  className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl transform transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <h3 className="text-white text-xl font-bold">
                      Background Preview
                    </h3>
                    <button
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
                      onClick={() => setModalOpen(false)}
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="relative w-full bg-gradient-to-br from-gray-100 to-gray-200 p-6">
                    <div className="relative w-full aspect-video bg-white rounded-xl overflow-hidden shadow-inner">
                      <img
                        src={
                          modalImage.url ||
                          (Array.isArray(modalImage.thumbnails) &&
                            modalImage.thumbnails[0])
                        }
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50">
                    {modalError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{modalError}</span>
                      </div>
                    )}
                    {modalSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{modalSuccess}</span>
                      </div>
                    )}

                    {uploadProgress !== null && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${Math.round(uploadProgress)}%`,
                              background:
                                "var(--app-background-color, #007cb6)",
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Uploading: {Math.round(uploadProgress)}%
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {modalImage?._id?.startsWith("local-") && (
                        <button
                          className="flex-1 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                          style={{
                            background:
                              uploadProgress !== null ? "#9ca3af" : "#ff007a",
                          }}
                          disabled={uploadProgress !== null}
                          onClick={handleUploadImageToServer}
                        >
                          {uploadProgress !== null ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : (
                            "Upload Image"
                          )}
                        </button>
                      )}
                      <button
                        className="flex-1 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--app-background-color, #007cb6) 0%, #0056b3 100%)",
                        }}
                        disabled={modalLoading || uploadProgress !== null}
                        onClick={handleSetBackgroundImage}
                      >
                        {modalLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Setting...
                          </span>
                        ) : (
                          "Set as Background"
                        )}
                      </button>
                      <button
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold transition-all hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50"
                        onClick={() => {
                          setModalOpen(false);
                        }}
                        disabled={modalLoading || uploadProgress !== null}
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
