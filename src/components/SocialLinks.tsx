import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaXmark, FaPlus } from "react-icons/fa6";
import leftArrow from "../assets/left-arrow.png";
import rightArrow from "../assets/right-arrow.png";
import { LINK_TYPES, getLinkType } from "../config/linkTypes";
import {
  DisplayLink,
  SocialLink,
  openSocialLink,
} from "../utils/socialLinks";

const OCTAGON =
  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

const VISIBLE = 5;

/* ------------------------------------------------------------------ */
/* Public view: octagon icon + scrolling row (5 visible, arrows after) */
/* ------------------------------------------------------------------ */

export function SocialIconButton({
  link,
  bgColor,
  size = 56,
}: {
  link: DisplayLink;
  bgColor: string;
  size?: number;
}) {
  const Icon = link.icon;
  return (
    <button
      type="button"
      title={link.label}
      aria-label={link.label}
      onClick={() => openSocialLink(link.url)}
      className="flex-shrink-0 cursor-pointer"
      // Octagon stays `size` px (fits 5 per row); only the glyph inside is enlarged
      style={{ width: "100%", maxWidth: size, aspectRatio: "1 / 1", padding: 3 }}
    >
      <div
        style={{
          clipPath: OCTAGON,
          backgroundColor: bgColor,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ clipPath: OCTAGON, background: "rgba(255,255,255,0.15)" }}
        >
          <Icon style={{ width: "72%", height: "72%" }} color="white" />
        </div>
      </div>
    </button>
  );
}

export function SocialLinksScroller({
  links,
  bgColor,
  size = 56,
}: {
  links: DisplayLink[];
  bgColor: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const overflowing = links.length > VISIBLE;

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [links.length]);

  if (!links.length) return null;

  const scrollByPage = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
    setTimeout(update, 350);
  };

  return (
    <div className="relative w-full mb-6">
      {overflowing && canLeft && (
        <button
          type="button"
          aria-label="Scroll links left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white/10 rounded-full"
          onClick={() => scrollByPage(-1)}
        >
          <img src={leftArrow} alt="" className="w-8 h-8 object-contain" />
        </button>
      )}
      <div
        ref={ref}
        onScroll={update}
        className="flex overflow-x-hidden items-center no-scrollbar"
        style={{
          scrollBehavior: "smooth",
          scrollSnapType: "x mandatory" as any,
          justifyContent: overflowing ? "flex-start" : "center",
        }}
      >
        {links.map((l) => (
          <div
            key={l.key}
            className="flex items-center justify-center px-px"
            style={{
              flex: `0 0 ${100 / VISIBLE}%`,
              scrollSnapAlign: "start" as any,
            }}
          >
            <SocialIconButton link={l} bgColor={bgColor} size={size} />
          </div>
        ))}
      </div>
      {overflowing && canRight && (
        <button
          type="button"
          aria-label="Scroll links right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white/10 rounded-full"
          onClick={() => scrollByPage(1)}
        >
          <img src={rightArrow} alt="" className="w-8 h-8 object-contain" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form: dropdown (icon + label) + URL input rows                      */
/* ------------------------------------------------------------------ */

function TypeDropdown({
  value,
  usedTypes,
  allowedKeys,
  onChange,
}: {
  value: string;
  usedTypes: string[];
  allowedKeys?: string[];
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const current = value ? getLinkType(value) : undefined;
  const options = LINK_TYPES.filter(
    (t) =>
      (!allowedKeys || allowedKeys.includes(t.key)) &&
      (t.key === value || !usedTypes.includes(t.key))
  );
  const CurIcon = current?.icon;

  return (
    <div ref={boxRef} className="relative flex-shrink-0" style={{ width: 150 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white rounded-full px-3 py-1 border-2 border-blue-300 flex items-center justify-between gap-2 text-gray-600"
      >
        <span className="flex items-center gap-2 truncate">
          {CurIcon && <CurIcon size={18} />}
          <span className="truncate text-sm">
            {current ? current.label : "Select"}
          </span>
        </span>
        <FaChevronDown size={12} />
      </button>
      {open && (
        <ul
          className="absolute z-40 mt-1 w-full bg-white rounded-xl border-2 border-blue-300 shadow-lg overflow-y-auto"
          style={{ maxHeight: 240 }}
        >
          {options.map((t) => {
            const I = t.icon;
            return (
              <li key={t.key}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 ${
                    t.key === value ? "bg-blue-100" : ""
                  }`}
                  onClick={() => {
                    onChange(t.key);
                    setOpen(false);
                  }}
                >
                  <I size={18} />
                  {t.label}
                </button>
              </li>
            );
          })}
          {!options.length && (
            <li className="px-3 py-2 text-sm text-gray-400">No more options</li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * Editable list of extra links. Rows keep incomplete (empty type/url) entries
 * in state; run `cleanSocialLinks` before submitting.
 */
export function SocialLinkPicker({
  value,
  onChange,
  allowedKeys,
  addLabel = "Add link",
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  /** Restrict dropdown to these type keys (defaults to the full catalog). */
  allowedKeys?: string[];
  addLabel?: string;
}) {
  const used = value.map((v) => v.type).filter(Boolean);
  const available = LINK_TYPES.filter(
    (t) => (!allowedKeys || allowedKeys.includes(t.key)) && !used.includes(t.key)
  );
  const hasEmptyRow = value.some((v) => !v.type);

  const update = (i: number, patch: Partial<SocialLink>) =>
    onChange(value.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  return (
    <div className="w-full flex flex-col gap-2">
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <TypeDropdown
            value={row.type}
            usedTypes={used}
            allowedKeys={allowedKeys}
            onChange={(k) => update(i, { type: k })}
          />
          <input
            type="text"
            className="flex-1 min-w-0 bg-white rounded-full px-4 py-1 border-2 border-blue-300 text-gray-500 outline-none placeholder-gray-400"
            placeholder={row.type === "video" ? "Video URL" : "https://"}
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <button
            type="button"
            aria-label="Remove link"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 text-red-500 flex items-center justify-center"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            <FaXmark />
          </button>
        </div>
      ))}
      {available.length > 0 && !hasEmptyRow && (
        <button
          type="button"
          className="self-start flex items-center gap-2 bg-white rounded-full px-4 py-1 border-2 border-blue-300 text-gray-600 text-sm"
          onClick={() => onChange([...value, { type: "", url: "" }])}
        >
          <FaPlus size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}
