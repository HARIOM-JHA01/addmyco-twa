export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const isTelegramPublicLink = (url: string): boolean => {
  try {
    if (!url || !url.trim()) return false;

    const parsed = new URL(url);

    // Must be t.me domain
    if (parsed.hostname !== "t.me") return false;

    // Get the path and remove leading/trailing slashes
    const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return false;

    // Disallow private/invite links that start with +
    if (path.startsWith("+")) return false;

    // Disallow joinchat links (old invite format)
    if (path.startsWith("joinchat")) return false;

    // Disallow private channel links (c/channel_id format)
    if (path.startsWith("c/")) return false;

    // Extract username (first part before any /)
    const username = path.split("/")[0];

    // Public channel/group usernames must be 5-32 chars, alphanumeric + underscores
    return /^[A-Za-z0-9_]{5,32}$/.test(username);
  } catch (e) {
    return false;
  }
};
