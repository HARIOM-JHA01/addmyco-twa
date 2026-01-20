import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchAdvertisements,
  trackAdDisplay,
} from "../services/advertisementService";

interface Advertisement {
  _id: string;
  imageUrl?: string;
  Banner?: string;
  redirectUrl?: string;
  Link?: string;
  position?: string;
}

interface BottomCircleAdBannerProps {
  fallbackImage?: string;
  onFallbackClick?: () => void;
  isFooterMode?: boolean;
}

export default function BottomCircleAdBanner({
  fallbackImage,
  onFallbackClick,
  isFooterMode = false,
}: BottomCircleAdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trackedAds, setTrackedAds] = useState<Set<string>>(new Set());

  // Fetch advertisements on component mount
  useEffect(() => {
    const loadAds = async () => {
      setLoading(true);
      try {
        console.log("[BottomCircleAd] Fetching BOTTOM_CIRCLE ads...");
        const advertisements = await fetchAdvertisements("BOTTOM_CIRCLE");

        if (advertisements && advertisements.length > 0) {
          console.log("[BottomCircleAd] Loaded ads:", advertisements.length);
          setAds(advertisements);
        } else {
          console.log("[BottomCircleAd] No ads found");
          setAds([]);
        }
      } catch (err: any) {
        console.error("[BottomCircleAd] Error loading ads:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  // Track display when ad changes
  useEffect(() => {
    if (ads.length > 0) {
      const currentAd = ads[currentIndex];
      if (currentAd && !trackedAds.has(currentAd._id)) {
        console.log("[BottomCircleAd] Tracking display for ad:", currentAd._id);
        trackAdDisplay(currentAd._id);
        setTrackedAds((prev) => new Set([...prev, currentAd._id]));
      }
    }
  }, [currentIndex, ads, trackedAds]);

  // Show fallback image if no ads or still loading in footer mode
  if (isFooterMode) {
    if (loading) {
      return fallbackImage ? (
        <div
          className="relative flex justify-center items-center w-24 cursor-pointer"
          onClick={onFallbackClick}
        >
          <img
            src={fallbackImage}
            alt="Default"
            className="w-20 h-20 rounded-full bg-white border-4 border-[#007cb6] z-20 absolute -top-14 left-1/2 -translate-x-1/2 shadow-lg"
            style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
          />
        </div>
      ) : null;
    }

    if (ads.length === 0) {
      return fallbackImage ? (
        <div
          className="relative flex justify-center items-center w-24 cursor-pointer"
          onClick={onFallbackClick}
        >
          <img
            src={fallbackImage}
            alt="Default"
            className="w-20 h-20 rounded-full bg-white border-4 border-[#007cb6] z-20 absolute -top-14 left-1/2 -translate-x-1/2 shadow-lg"
            style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
          />
        </div>
      ) : null;
    }

    const currentAd = ads[currentIndex];
    const adImage = currentAd.imageUrl || currentAd.Banner;

    const handleAdClick = () => {
      const redirectUrl = currentAd.redirectUrl || currentAd.Link;
      if (redirectUrl) {
        window.open(redirectUrl, "_blank");
      }
    };

    const handlePrevious = () => {
      setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    };

    return (
      <div className="relative flex justify-center items-center w-24 group">
        {adImage && (
          <div
            onClick={handleAdClick}
            className="w-20 h-20 rounded-full bg-white border-4 border-[#007cb6] z-20 absolute -top-14 left-1/2 -translate-x-1/2 shadow-lg cursor-pointer overflow-hidden flex items-center justify-center"
            style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
          >
            <img
              src={adImage}
              alt="Advertisement"
              className="w-full h-full object-cover hover:scale-110 transition-transform"
              onError={(e) => {
                console.warn(
                  "[BottomCircleAd] Image load error:",
                  currentAd._id,
                );
                (e.target as HTMLImageElement).src = fallbackImage || "";
              }}
            />
          </div>
        )}

        {/* Navigation Arrows - Only visible on hover for footer mode */}
        {ads.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
              aria-label="Previous ad"
            >
              <ChevronLeft size={16} className="text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-8 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
              aria-label="Next ad"
            >
              <ChevronRight size={16} className="text-gray-800" />
            </button>
          </>
        )}

        {/* Indicators - show as small dots below */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-0.5 absolute -bottom-6 left-1/2 -translate-x-1/2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[#007cb6] w-3"
                    : "bg-gray-400 w-1"
                }`}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];
  const adImage = currentAd.imageUrl || currentAd.Banner;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  };

  const handleAdClick = () => {
    const redirectUrl = currentAd.redirectUrl || currentAd.Link;
    if (redirectUrl) {
      window.open(redirectUrl, "_blank");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-4 px-2">
      <div className="relative bg-white rounded-lg overflow-hidden shadow-md">
        {/* Ad Image */}
        {adImage && (
          <div
            className="w-full h-48 bg-gray-200 cursor-pointer flex items-center justify-center overflow-hidden"
            onClick={handleAdClick}
          >
            <img
              src={adImage}
              alt="Advertisement"
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              onError={(e) => {
                console.warn(
                  "[BottomCircleAd] Image load error:",
                  currentAd._id,
                );
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Navigation Arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition"
              aria-label="Previous ad"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition"
              aria-label="Next ad"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </>
        )}

        {/* Indicators */}
        {ads.length > 1 && (
          <div className="flex justify-center gap-1 p-2 bg-gray-100">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-blue-600 w-6" : "bg-gray-400 w-2"
                }`}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Ad Counter */}
        {ads.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{ads.length}
          </div>
        )}
      </div>
    </div>
  );
}
