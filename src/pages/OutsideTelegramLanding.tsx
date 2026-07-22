import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

const TELEGRAM_CREATE_URL = "https://t.me/AddMyCo/49";
const SITE_URL = "https://addmy.co";

/** Faint decorative dot grid (matches the mockup's dotted patterns). */
const DotGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={className}
    style={{
      backgroundImage: "radial-gradient(#2f6bff 1.4px, transparent 1.4px)",
      backgroundSize: "14px 14px",
      opacity: 0.18,
    }}
  />
);

// Deterministic bubble field — varied size, position, speed and drift so the
// motion reads as organic rather than a repeating loop.
const BUBBLES = [
  { left: "8%", size: 26, dur: 15, delay: 0, drift: "24px" },
  { left: "20%", size: 14, dur: 11, delay: 3, drift: "-18px" },
  { left: "33%", size: 40, dur: 19, delay: 6, drift: "16px" },
  { left: "46%", size: 18, dur: 13, delay: 1.5, drift: "-28px" },
  { left: "58%", size: 30, dur: 17, delay: 8, drift: "20px" },
  { left: "70%", size: 12, dur: 10, delay: 4.5, drift: "-14px" },
  { left: "82%", size: 34, dur: 21, delay: 2, drift: "26px" },
  { left: "90%", size: 20, dur: 14, delay: 7, drift: "-22px" },
  { left: "15%", size: 22, dur: 16, delay: 9.5, drift: "18px" },
  { left: "64%", size: 16, dur: 12, delay: 11, drift: "-16px" },
];

/** Rising translucent bubbles that drift up the whole viewport. */
const BubbleField: React.FC = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:hidden"
  >
    {BUBBLES.map((b, i) => (
      <span
        key={i}
        className="absolute bottom-[-60px] rounded-full animate-bubble-rise"
        style={{
          left: b.left,
          width: b.size,
          height: b.size,
          animationDuration: `${b.dur}s`,
          animationDelay: `${b.delay}s`,
          ["--bubble-drift" as string]: b.drift,
          background:
            "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95), rgba(96,150,255,0.85) 42%, rgba(37,90,224,0.7) 100%)",
          boxShadow:
            "0 6px 18px rgba(47,107,255,0.35), inset 0 0 6px rgba(255,255,255,0.5)",
        }}
      />
    ))}
  </div>
);

/** Layered animated waves anchored to the bottom of the page. */
const Waves: React.FC = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 overflow-hidden"
  >
    {[
      { fill: "rgba(156,194,255,0.45)", dur: "14s", h: "h-40" },
      { fill: "rgba(96,150,255,0.40)", dur: "10s", h: "h-32" },
      { fill: "rgba(47,107,255,0.35)", dur: "7s", h: "h-24" },
    ].map((w, i) => (
      <svg
        key={i}
        className={`absolute bottom-0 left-0 w-[200%] animate-wave-shift ${w.h} motion-reduce:animate-none`}
        style={{ animationDuration: w.dur }}
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <path
          fill={w.fill}
          d="M0,64 C180,120 360,20 720,64 C1080,108 1260,20 1440,64 L1440,160 L0,160 Z"
        />
      </svg>
    ))}
  </div>
);

/**
 * Landing page shown when the app is opened OUTSIDE Telegram (regular browser).
 * Inside Telegram we keep the existing WelcomePage flow untouched.
 */
const OutsideTelegramLanding: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  // Once the user has explicitly chosen mute/unmute, stop auto-unmuting.
  const userChoseRef = useRef(false);

  const applyMuted = (next: boolean) => {
    setMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
      // Resume playback in case the browser paused it.
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMuted = () => {
    userChoseRef.current = true;
    applyMuted(!muted);
  };

  // Browsers block autoplay WITH sound, so the video starts muted. Unmute on
  // the user's first interaction anywhere on the page (unless they've already
  // used the toggle themselves).
  useEffect(() => {
    const unmuteOnFirstInteraction = () => {
      if (!userChoseRef.current) {
        applyMuted(false);
      }
      cleanup();
    };

    const events: (keyof DocumentEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
      "scroll",
    ];

    const cleanup = () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, unmuteOnFirstInteraction),
      );
    };

    events.forEach((evt) =>
      document.addEventListener(evt, unmuteOnFirstInteraction, {
        passive: true,
      }),
    );

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoToCreate = () => {
    window.open(TELEGRAM_CREATE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #eaf4ff 0%, #dcecfb 55%, #cfe4f9 100%)",
      }}
    >
      {/* Ambient motion */}
      <Waves />
      <BubbleField />

      {/* Decorative dot grids */}
      <DotGrid className="pointer-events-none absolute right-4 top-24 z-0 h-20 w-24" />
      <DotGrid className="pointer-events-none absolute right-6 top-1/2 z-0 h-24 w-24" />

      <div className="relative z-10 flex w-full max-w-[440px] flex-1 flex-col px-6 pb-8 pt-6">
        {/* Top bar: centered logo */}
        <header className="mb-8 flex animate-fade-slide-up items-center justify-center">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-extrabold tracking-tight"
          >
            <span className="text-[#1b2340]">AddMy</span>
            <span className="text-[#2f6bff]">.co</span>
          </a>
        </header>

        {/* Heading */}
        <div
          className="mb-6 animate-fade-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          <h1 className="text-4xl font-extrabold leading-tight text-[#1b2340]">
            Welcome to
          </h1>
          <h1 className="text-5xl font-extrabold leading-[1.05] text-[#2f6bff]">
            AddMy.co
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="mb-8 animate-fade-slide-up text-center text-lg font-medium text-[#4a5578] [text-wrap:balance]"
          style={{ animationDelay: "160ms" }}
        >
          Upgrade Your Namecard to Dynamic is{" "}
          <span className="whitespace-nowrap font-semibold text-[#2f6bff]">
            Free Forever
          </span>
        </p>

        {/* Center video (replaces the sample namecard), ~85% scale */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="relative mx-auto w-[85%] animate-fade-slide-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/welcome-video.mp4"
                poster="/welcome-video-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
              {/* Mute / unmute toggle */}
              <button
                type="button"
                onClick={toggleMuted}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 active:scale-95"
              >
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Guiding caption + curved arrow (matches mockup) */}
        <div
          className="mt-8 flex animate-fade-slide-up items-end gap-2 pl-2"
          style={{ animationDelay: "320ms" }}
        >
          <svg
            width="34"
            height="40"
            viewBox="0 0 34 40"
            fill="none"
            aria-hidden
            className="mb-1 text-[#2f6bff]"
          >
            <path
              d="M4 4c-1 12 3 22 14 27M18 31l-8 2M18 31l2-8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium text-[#4a5578]">
            We&apos;ll direct you to{" "}
            <span className="font-semibold text-[#2f6bff]">Create One</span>
          </p>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={handleGoToCreate}
          style={{ animationDelay: "400ms" }}
          className="mt-4 flex w-full animate-fade-slide-up items-center justify-center gap-2 rounded-2xl bg-[#2f6bff] py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-[#245ae0] hover:shadow-xl active:scale-[0.98]"
        >
          Go to Create One
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OutsideTelegramLanding;
