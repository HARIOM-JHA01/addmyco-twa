/**
 * Validation utilities for form inputs
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Empty is valid (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (accepts various formats)
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Empty is valid (optional field)
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Check if it's a valid number with 7-15 digits, optionally starting with +
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
};

// URL validation - checks if URL is in valid format
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)

  // Check if it already has a protocol
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Try adding https:// and validate
  try {
    new URL("https://" + url);
    return true;
  } catch {
    return false;
  }
};

// Format URL - ensures URL has proper protocol
export const formatUrl = (url: string): string => {
  if (!url) return "";

  // Trim whitespace
  url = url.trim();

  // If already has protocol, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Add https:// prefix
  return "https://" + url;
};

// Normalize URL for display - removes protocol for cleaner display
export const normalizeUrlForDisplay = (url: string): string => {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "");
};

// Get validation error message for email
export const getEmailError = (email: string): string => {
  if (!email) return "";
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

// Get validation error message for phone
export const getPhoneError = (phone: string): string => {
  if (!phone) return "";
  if (!isValidPhoneNumber(phone)) {
    return "Please enter a valid phone number (7-15 digits)";
  }
  return "";
};

// Get validation error message for URL
export const getUrlError = (url: string, fieldName: string = "URL"): string => {
  if (!url) return "";
  if (!isValidUrl(url)) {
    return `Please enter a valid ${fieldName} (e.g., example.com or https://example.com)`;
  }
  return "";
};

// Validate multiple URL fields
export interface UrlFieldValidation {
  [key: string]: string; // field name -> error message
}

export const validateUrlFields = (fields: {
  [key: string]: string;
}): UrlFieldValidation => {
  const errors: UrlFieldValidation = {};

  Object.entries(fields).forEach(([fieldName, url]) => {
    if (url && !isValidUrl(url)) {
      errors[fieldName] = `Invalid ${fieldName} URL format`;
    }
  });

  return errors;
};

// Format all URLs in an object
export const formatAllUrls = (data: {
  [key: string]: any;
}): { [key: string]: any } => {
  const urlFields = [
    "WhatsApp",
    "WeChat",
    "Line",
    "Instagram",
    "Facebook",
    "Twitter",
    "Youtube",
    "Linkedin",
    "TikTok",
    "website",
    "chamberwebsite",
    "telegram",
    "telegramId",
    "tgchannel",
    "chamberfanpage",
    "Skype",
  ];

  const formatted = { ...data };

  urlFields.forEach((field) => {
    if (formatted[field] && typeof formatted[field] === "string") {
      formatted[field] = formatUrl(formatted[field]);
    }
  });

  return formatted;
};

// Check if any validation errors exist
export const hasValidationErrors = (errors: {
  [key: string]: string;
}): boolean => {
  return Object.values(errors).some((error) => error !== "");
};

// Format image URL - handles both full URLs and relative paths
export const formatImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  const trimmed = url.trim();
  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Otherwise assume it's a relative asset path and prefix the admin assets base
  const base = "https://admin.addmy.co/assets/";
  // Avoid double slashes when url already starts with a slash
  return base + (trimmed.startsWith("/") ? trimmed.slice(1) : trimmed);
};

// Function to detect if running inside Telegram WebApp
export const isTelegramWebApp = (): boolean => {
  try {
    // Check for Telegram WebApp object and Telegram in user agent
    return !!(
      window.Telegram &&
      window.Telegram.WebApp &&
      window.navigator.userAgent.includes("Telegram")
    );
  } catch (e) {
    return false;
  }
};

// Function to create a proper Telegram Mini App deep link
export const createTelegramMiniAppLink = (username: string): string => {
  // Use the startapp parameter to directly open the Mini App
  // The 'startapp' parameter takes a JSON string that gets passed to the Mini App
  const startAppParam = encodeURIComponent(JSON.stringify({ start: username }));

  // Using Telegram's direct Mini App opening format
  return `https://t.me/AddmyCo_bot/app?startapp=${startAppParam}`;
};

// Video validation constants
export const MAX_VIDEO_SIZE_MB = 6;
export const MAX_VIDEO_DURATION_SECONDS = 120;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024; // 6MB in bytes

// Interface for video validation result
export interface VideoValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate video file size (must be less than 6MB)
export const validateVideoSize = (file: File): VideoValidationResult => {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Video file size must be less than ${MAX_VIDEO_SIZE_MB}MB. Current size: ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB`,
    };
  }
  return { isValid: true };
};

// Validate video duration (must be less than 120 seconds)
export const validateVideoDuration = (
  file: File
): Promise<VideoValidationResult> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        resolve({
          isValid: false,
          error: `Video duration must be less than ${MAX_VIDEO_DURATION_SECONDS} seconds (2 minutes). Current duration: ${Math.floor(
            duration
          )} seconds`,
        });
      } else {
        resolve({ isValid: true });
      }
    };

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        isValid: false,
        error: "Failed to load video metadata. Please try another video file.",
      });
    };

    video.src = URL.createObjectURL(file);
  });
};

// Comprehensive video validation (checks both size and duration)
export const validateVideo = async (
  file: File
): Promise<VideoValidationResult> => {
  // First check file size
  const sizeValidation = validateVideoSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Then check duration
  const durationValidation = await validateVideoDuration(file);
  return durationValidation;
};
