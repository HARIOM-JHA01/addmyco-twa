import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

interface BottomCircleAdContextType {
  ads: Advertisement[];
  currentIndex: number;
  loading: boolean;
  trackedAds: Set<string>;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
  trackDisplay: (adId: string) => void;
}

const BottomCircleAdContext = createContext<
  BottomCircleAdContextType | undefined
>(undefined);

export function BottomCircleAdProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trackedAds, setTrackedAds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Fetch advertisements only once when the provider mounts
  useEffect(() => {
    if (initialized) return;

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
        setInitialized(true);
      }
    };

    loadAds();
  }, [initialized]);

  const trackDisplay = (adId: string) => {
    if (!trackedAds.has(adId)) {
      console.log("[BottomCircleAd] Tracking display for ad:", adId);
      trackAdDisplay(adId);
      setTrackedAds((prev) => new Set([...prev, adId]));
    }
  };

  return (
    <BottomCircleAdContext.Provider
      value={{
        ads,
        currentIndex,
        loading,
        trackedAds,
        setCurrentIndex,
        trackDisplay,
      }}
    >
      {children}
    </BottomCircleAdContext.Provider>
  );
}

export function useBottomCircleAd() {
  const context = useContext(BottomCircleAdContext);
  if (context === undefined) {
    throw new Error(
      "useBottomCircleAd must be used within a BottomCircleAdProvider",
    );
  }
  return context;
}
