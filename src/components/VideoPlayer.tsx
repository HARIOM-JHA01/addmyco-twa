import React, { useEffect, useRef, useState } from "react";

type Props = {
  src?: string;
  poster?: string;
  className?: string;
  loop?: boolean;
  controls?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
};

const VideoPlayer: React.FC<Props> = ({
  src,
  poster,
  className,
  loop = false,
  controls = false,
  autoPlay = true,
  playsInline = true,
}) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [showUnmute, setShowUnmute] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;

    v.loop = !!loop;
    v.playsInline = !!playsInline;
    v.autoplay = !!autoPlay;

    // Try to autoplay with sound. If browser blocks it, fall back to muted autoplay
    // and show an overlay button so the user can unmute (user gesture required by many browsers).
    const tryPlay = async () => {
      v.muted = false;
      try {
        await v.play();
        setShowUnmute(false);
      } catch (err) {
        // Autoplay with sound blocked; mute and try again
        v.muted = true;
        try {
          await v.play();
        } catch (err) {
          // ignore
        }
        setShowUnmute(true);
      }
    };

    tryPlay();

    return () => {
      // pause when unmounting to avoid continued playback
      try {
        v.pause();
      } catch {}
    };
  }, [src, loop, autoPlay, playsInline]);

  const handleUnmute = async () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    try {
      await v.play();
      setShowUnmute(false);
    } catch (err) {
      // keep overlay if still blocked
    }
  };

  if (!src) return null;

  // Detect if the className contains 'rounded-full' to apply circular styling to unmute button
  const isCircular = className?.includes('rounded-full');

  return (
    <div className={`relative ${className || ''}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="w-full h-full"
        style={{ objectFit: 'cover' }}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
      />
      {showUnmute && (
        <button
          onClick={handleUnmute}
          className={`absolute inset-0 m-auto flex items-center justify-center bg-black/40 text-white ${isCircular ? 'rounded-full' : 'rounded-xl'}`}
          aria-label="Unmute video"
        >
          Unmute
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
