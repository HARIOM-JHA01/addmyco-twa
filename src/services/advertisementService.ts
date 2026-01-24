import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Store session ID globally for tracking
let currentSessionId: string | null = null;

// Cache for user location data
let cachedLocationData: { country: string; timezone: string } | null = null;

/**
 * Fetch user location data from ipapi.co
 */
const fetchUserLocation = async (): Promise<{
  country: string;
  timezone: string;
}> => {
  // Return cached data if available
  if (cachedLocationData) {
    return cachedLocationData;
  }

  try {
    const response = await axios.get("https://ipapi.co/json/", {
      timeout: 5000,
    });

    if (response.data) {
      cachedLocationData = {
        country: response.data.country_code || "GLOBAL",
        timezone:
          response.data.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      return cachedLocationData;
    }
  } catch (error) {
    console.warn("Failed to fetch location from ipapi.co:", error);
  }

  // Fallback to browser timezone
  const fallback = {
    country: "GLOBAL",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  cachedLocationData = fallback;
  return fallback;
};

export interface Advertisement {
  _id: string;
  title?: string;
  description?: string;
  position?: string;
  country?: string;
  imageUrl?: string;
  Banner?: string;
  targetUrl?: string;
  redirectUrl?: string;
  Link?: string;
  displayCount?: number;
  displayUsed?: number;
  displayRemaining?: number;
  status?: string;
  approvalStatus?: string;
  viewCount?: number;
  clickCount?: number;
  ctrPercentage?: number;
  impressions?: number;
  clicks?: number;
  credits?: number;
  createdAt?: string;
}

/**
 * Fetch active advertisements from the public API
 * Falls back to system banners if no active ads are found
 * Defaults to HOME_BANNER position if not specified
 */
export const fetchAdvertisements = async (
  position: string = "HOME_BANNER",
  country?: string,
): Promise<Advertisement[]> => {
  try {
    // Try to fetch active advertisements from the new API
    const params = new URLSearchParams();
    params.append("position", position);
    if (country) params.append("country", country);
    params.append("limit", "100");

    const res = await axios.get(
      `${API_BASE_URL}/api/v1/advertisement/active?${params.toString()}`,
      { timeout: 5000 },
    );

    const ads = res.data?.data || [];
    // Store sessionId for tracking
    if (res.data?.sessionId) {
      currentSessionId = res.data.sessionId;
    }

    if (ads.length > 0) {
      console.log("Loaded advertisements from public API:", ads.length);
      return ads;
    }

    // For BOTTOM_CIRCLE position, return empty array if API returns no data
    if (position === "BOTTOM_CIRCLE") {
      console.log("No advertisements found for BOTTOM_CIRCLE position");
      return [];
    }
  } catch (err) {
    console.warn("Failed to fetch active advertisements, using fallback:", err);
  }

  // Fallback: fetch system banners from the old API
  try {
    const bannerRes = await axios.get(`${API_BASE_URL}/banner`, {
      timeout: 5000,
    });
    const banners = bannerRes.data?.data || [];
    if (banners.length > 0) {
      console.log("Loaded system banners as fallback:", banners.length);
      return banners;
    }
  } catch (fallbackErr) {
    console.error("Failed to fetch fallback banners:", fallbackErr);
  }

  return [];
};

/**
 * Track advertisement display/impression
 */
export const trackAdDisplay = async (adId: string): Promise<void> => {
  try {
    // Get user location data
    const locationData = await fetchUserLocation();

    const body: { sessionId?: string; country: string; timezone: string } = {
      country: locationData.country,
      timezone: locationData.timezone,
    };

    if (currentSessionId) {
      body.sessionId = currentSessionId;
    }

    await axios.post(
      `${API_BASE_URL}/api/v1/advertisement/${adId}/track-display`,
      body,
      { timeout: 3000 },
    );
  } catch (err) {
    console.warn(`Failed to track display for ad ${adId}:`, err);
  }
};

/**
 * Track advertisement click
 */
export const trackAdClick = async (adId: string): Promise<void> => {
  try {
    // Get user location data
    const locationData = await fetchUserLocation();

    const body: { sessionId?: string; country: string; timezone: string } = {
      country: locationData.country,
      timezone: locationData.timezone,
    };

    if (currentSessionId) {
      body.sessionId = currentSessionId;
    }

    await axios.post(
      `${API_BASE_URL}/api/v1/advertisement/${adId}/track-click`,
      body,
      { timeout: 3000 },
    );
  } catch (err) {
    console.warn(`Failed to track click for ad ${adId}:`, err);
  }
};

/**
 * Get statistics for a specific advertisement
 */
export const getAdStatistics = async (adId: string, token: string) => {
  try {
    const url = `${API_BASE_URL}/api/v1/advertisement/${adId}/stats`;
    console.log("Calling API:", url);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    console.log("API Response:", response.data);
    return response.data?.data;
  } catch (err: any) {
    console.error(
      "Error in getAdStatistics:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

/**
 * Get user's advertisements with view summary
 */
export const getMyAdsWithStats = async (
  token: string,
  filters?: {
    status?: string;
    position?: string;
    page?: number;
    limit?: number;
  },
) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.position) params.append("position", filters.position);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const response = await axios.get(
    `${API_BASE_URL}/api/v1/advertisement/my-ads?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data?.data;
};
