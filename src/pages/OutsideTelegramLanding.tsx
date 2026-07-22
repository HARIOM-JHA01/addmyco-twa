import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const TELEGRAM_CREATE_URL = "https://t.me/AddMyCo/49";

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
        once: false,
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
      className="relative flex min-h-screen w-full flex-col items-center"
      style={{
        background:
          "linear-gradient(180deg, #eaf4ff 0%, #dcecfb 55%, #cfe4f9 100%)",
      }}
    >
      <div className="flex w-full max-w-[420px] flex-1 flex-col px-6 pb-8 pt-6">
        {/* Top bar: centered logo, no menu */}
        <header className="mb-8 flex items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#1b2340]">AddMy</span>
            <span className="text-[#2f6bff]">.co</span>
          </span>
        </header>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold leading-tight text-[#1b2340]">
            Welcome to
          </h1>
          <h1 className="text-5xl font-extrabold leading-tight text-[#2f6bff]">
            Dynamic
            <br />
            NameCard
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mb-8 text-lg font-medium text-[#4a5578]">
          Upgrade Your Namecard to Dynamic is{" "}
          <span className="font-semibold text-[#2f6bff]">Free Forever</span>
        </p>

        {/* Center video (replaces the sample namecard), ~85% scale */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-[85%]">
            <video
              ref={videoRef}
              className="w-full rounded-2xl shadow-xl"
              src="/welcome-video.mp4"
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
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={handleGoToCreate}
          className="mt-10 w-full rounded-2xl bg-[#2f6bff] py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-[#245ae0]"
        >
          Go to Create One
        </button>
      </div>
    </div>
  );
};

export default OutsideTelegramLanding;
