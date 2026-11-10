import WebApp from "@twa-dev/sdk";
import { FIXED_LINK_TYPES, getLinkType } from "../config/linkTypes";
import type { IconType } from "react-icons";
import { FaLink } from "react-icons/fa6";
import { formatUrl } from "./validation";

export interface SocialLink {
  type: string;
  url: string;
}

export interface DisplayLink {
  key: string;
  type: string;
  label: string;
  url: string;
  icon: IconType;
}

export const isTelegramUrl = (url: string): boolean => {
  const u = (url || "").trim().toLowerCase();
  return (
    u.startsWith("tg://") ||
    /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me|telegram\.dog)(\/|$)/.test(u)
  );
};

/** Opens a link: Telegram links via the Telegram WebApp, everything else in a new tab. */
export const openSocialLink = (url: string) => {
  if (!url) return;
  if (isTelegramUrl(url)) {
    const u = url.trim();
    const full = u.startsWith("tg://") || /^https?:\/\//i.test(u) ? u : "https://" + u;
    try {
      WebApp.openLink(full);
      return;
    } catch {
      /* fall through */
    }
    window.open(full, "_blank");
    return;
  }
  window.open(formatUrl(url), "_blank");
};

/** Legacy fields that used to be separate inputs; used when a record has no `socialLinks` yet. */
const LEGACY_EXTRAS: [string, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["youtube", "Youtube"],
  ["twitter", "Twitter"],
];

export const getExtraLinks = (
  record: Record<string, any> | null | undefined
): SocialLink[] => {
  if (!record) return [];
  if (Array.isArray(record.socialLinks)) {
    return record.socialLinks.filter((l: SocialLink) => l?.type && l?.url);
  }
  return LEGACY_EXTRAS.filter(([, f]) => record[f]).map(([type, f]) => ({
    type,
    url: record[f],
  }));
};

const toDisplay = (type: string, url: string): DisplayLink | null => {
  if (!url || !url.trim()) return null;
  const t = getLinkType(type);
  return {
    key: type,
    type,
    label: t?.label || type,
    url,
    icon: t?.icon || FaLink,
  };
};

/**
 * Display order for Company / Chamber:
 * LinkedIn, Optional 1, Website, Optional 2, Channel 1, ...extras
 * Missing links are skipped.
 */
export const buildOrderedLinks = (
  fixed: { linkedin?: string; website?: string; channel1?: string },
  extras: SocialLink[]
): DisplayLink[] => {
  const seq: (DisplayLink | null)[] = [
    toDisplay(FIXED_LINK_TYPES.linkedin.key, fixed.linkedin || ""),
    extras[0] ? toDisplay(extras[0].type, extras[0].url) : null,
    toDisplay(FIXED_LINK_TYPES.website.key, fixed.website || ""),
    extras[1] ? toDisplay(extras[1].type, extras[1].url) : null,
    toDisplay(FIXED_LINK_TYPES.channel1.key, fixed.channel1 || ""),
    ...extras.slice(2).map((e) => toDisplay(e.type, e.url)),
  ];
  return seq.filter((x): x is DisplayLink => !!x);
};

/** Drops incomplete rows, de-duplicates by type and normalises URLs (Telegram links kept as-is). */
export const cleanSocialLinks = (list: SocialLink[]): SocialLink[] => {
  const seen = new Set<string>();
  const out: SocialLink[] = [];
  for (const l of list) {
    const type = (l.type || "").trim();
    const url = (l.url || "").trim();
    if (!type || !url || seen.has(type)) continue;
    seen.add(type);
    out.push({ type, url: url.startsWith("tg://") ? url : formatUrl(url) });
  }
  return out;
};
