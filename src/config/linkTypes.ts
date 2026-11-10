import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaTiktok,
  FaSnapchat,
  FaLine,
  FaWeixin,
  FaWhatsapp,
  FaTelegram,
  FaSkype,
  FaLinkedin,
  FaGlobe,
  FaTv,
  FaCirclePlay,
  FaPinterest,
  FaTwitch,
  FaGithub,
  FaDiscord,
  FaReddit,
  FaMedium,
  FaSpotify,
  FaBehance,
  FaDribbble,
  FaVk,
  FaTumblr,
  FaViber,
  FaSignalMessenger,
  FaSoundcloud,
  FaPatreon,
  FaThreads,
  FaBluesky,
  FaMastodon,
} from "react-icons/fa6";
import { SiKakaotalk, SiXiaohongshu } from "react-icons/si";

export interface LinkType {
  key: string;
  label: string;
  icon: IconType;
}

/** Fixed links for Company / Chamber (always present on create, not in the dropdown). */
export const FIXED_LINK_TYPES = {
  linkedin: { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  website: { key: "website", label: "Website", icon: FaGlobe },
  channel1: { key: "channel1", label: "Channel 1", icon: FaTelegram },
} satisfies Record<string, LinkType>;

/**
 * Catalog used by the dropdowns. Add a new entry here to make a new icon
 * available to users (keys are stored in the DB, so never rename an existing key).
 */
export const LINK_TYPES: LinkType[] = [
  { key: "channel2", label: "Channel 2", icon: FaTv },
  { key: "video", label: "Video", icon: FaCirclePlay },
  { key: "facebook", label: "Facebook", icon: FaFacebook },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "youtube", label: "YouTube", icon: FaYoutube },
  { key: "twitter", label: "X (Twitter)", icon: FaXTwitter },
  { key: "tiktok", label: "TikTok", icon: FaTiktok },
  { key: "threads", label: "Threads", icon: FaThreads },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchat },
  { key: "pinterest", label: "Pinterest", icon: FaPinterest },
  { key: "line", label: "LINE", icon: FaLine },
  { key: "wechat", label: "WeChat", icon: FaWeixin },
  { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
  { key: "telegram", label: "Telegram", icon: FaTelegram },
  { key: "viber", label: "Viber", icon: FaViber },
  { key: "signal", label: "Signal", icon: FaSignalMessenger },
  { key: "kakaotalk", label: "KakaoTalk", icon: SiKakaotalk },
  { key: "xiaohongshu", label: "Xiaohongshu", icon: SiXiaohongshu },
  { key: "skype", label: "Skype", icon: FaSkype },
  { key: "discord", label: "Discord", icon: FaDiscord },
  { key: "reddit", label: "Reddit", icon: FaReddit },
  { key: "twitch", label: "Twitch", icon: FaTwitch },
  { key: "github", label: "GitHub", icon: FaGithub },
  { key: "behance", label: "Behance", icon: FaBehance },
  { key: "dribbble", label: "Dribbble", icon: FaDribbble },
  { key: "medium", label: "Medium", icon: FaMedium },
  { key: "spotify", label: "Spotify", icon: FaSpotify },
  { key: "soundcloud", label: "SoundCloud", icon: FaSoundcloud },
  { key: "patreon", label: "Patreon", icon: FaPatreon },
  { key: "tumblr", label: "Tumblr", icon: FaTumblr },
  { key: "vk", label: "VK", icon: FaVk },
  { key: "bluesky", label: "Bluesky", icon: FaBluesky },
  { key: "mastodon", label: "Mastodon", icon: FaMastodon },
];

const ALL_TYPES: Record<string, LinkType> = {
  ...Object.fromEntries(LINK_TYPES.map((t) => [t.key, t])),
  ...Object.fromEntries(Object.values(FIXED_LINK_TYPES).map((t) => [t.key, t])),
};

export const getLinkType = (key: string): LinkType | undefined =>
  ALL_TYPES[key];

/**
 * Types offered in the dropdown for Company / Chamber extra links.
 * LinkedIn, Website and Channel 1 are fixed fields, so Telegram is also left out.
 */
export const COMPANY_EXTRA_KEYS = LINK_TYPES.map((t) => t.key).filter(
  (k) => k !== "telegram"
);
