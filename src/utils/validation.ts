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
    "SnapChat",
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
