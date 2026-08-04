import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LandingVideo {
  _id: string;
  title?: string;
  videoUrl: string;
  linkUrl: string;
  isCompressed?: boolean;
  originalSize?: number;
  compressedSize?: number;
  createdAt?: string;
}

const FALLBACK_VIDEO = "/welcome-video.mp4";
const FALLBACK_LINK = "https://t.me/AddMyCo/49";

export const fetchActiveLandingVideo = async (): Promise<{
  videoUrl: string;
  linkUrl: string;
  title?: string;
}> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/v1/landing-video/active`, {
      timeout: 5000,
    });

    if (res.data?.success && res.data?.data) {
      return {
        videoUrl: res.data.data.videoUrl,
        linkUrl: res.data.data.linkUrl,
        title: res.data.data.title,
      };
    }

    return { videoUrl: FALLBACK_VIDEO, linkUrl: FALLBACK_LINK };
  } catch (err) {
    console.warn("Failed to fetch landing video, using fallback:", err);
    return { videoUrl: FALLBACK_VIDEO, linkUrl: FALLBACK_LINK };
  }
};
