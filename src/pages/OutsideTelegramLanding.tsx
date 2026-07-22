import React from "react";

const TELEGRAM_CREATE_URL = "https://t.me/AddMyCo/49";

/**
 * Landing page shown when the app is opened OUTSIDE Telegram (regular browser).
 * Inside Telegram we keep the existing WelcomePage flow untouched.
 */
const OutsideTelegramLanding: React.FC = () => {
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
          <video
            className="w-[85%] rounded-2xl shadow-xl"
            src="/welcome-video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
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
