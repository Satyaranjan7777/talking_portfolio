import React, { useState, useEffect, useRef } from "react";
import { useProfile, useResume, useHeroMedia, useSettings } from "../../lib/content";
import { scrollToTarget } from "../../lib/scroll";

export default function Hero() {
  const PROFILE = useProfile();
  const resume = useResume();
  const heroMedia = useHeroMedia();
  const settings = useSettings();
  const features = settings?.features || {};
  const videoRef = useRef(null);

  const heroRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true);

  // Active video source state for seamless preloading
  const [activeSources, setActiveSources] = useState({
    mp4: heroMedia?.mp4Url || "/hero/hero.mp4",
    webm: heroMedia?.webmUrl || "/hero/hero.webm",
    poster: heroMedia?.posterUrl || "/portrait-bust.webp",
  });

  // Seamless video preloader: preload in hidden element, swap only after canplaythrough
  useEffect(() => {
    if (!heroMedia?.mp4Url && !heroMedia?.webmUrl) return;

    const newMp4 = heroMedia.mp4Url || "/hero/hero.mp4";
    const newWebm = heroMedia.webmUrl || "/hero/hero.webm";
    const newPoster = heroMedia.posterUrl || "/portrait-bust.webp";

    // If sources are already identical, no swap needed
    if (activeSources.mp4 === newMp4 && activeSources.webm === newWebm) {
      if (activeSources.poster !== newPoster) {
        setActiveSources((prev) => ({ ...prev, poster: newPoster }));
      }
      return;
    }

    let isCancelled = false;
    const preloadVideo = document.createElement("video");
    preloadVideo.preload = "auto";
    preloadVideo.muted = true;
    preloadVideo.playsInline = true;

    if (newWebm) {
      const srcWebm = document.createElement("source");
      srcWebm.src = newWebm;
      srcWebm.type = "video/webm";
      preloadVideo.appendChild(srcWebm);
    }
    if (newMp4) {
      const srcMp4 = document.createElement("source");
      srcMp4.src = newMp4;
      srcMp4.type = "video/mp4";
      preloadVideo.appendChild(srcMp4);
    }

    const onCanPlayThrough = () => {
      if (isCancelled) return;
      setActiveSources({
        mp4: newMp4,
        webm: newWebm,
        poster: newPoster,
      });

      // Maintain current playback and mute state on the active video element
      const activeVideo = videoRef.current;
      if (activeVideo) {
        const wasPaused = activeVideo.paused;
        const currentMuted = activeVideo.muted;
        activeVideo.load();
        activeVideo.muted = currentMuted;
        if (!wasPaused) {
          activeVideo.play().catch(() => {});
        }
      }
    };

    preloadVideo.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
    preloadVideo.load();

    return () => {
      isCancelled = true;
      preloadVideo.removeEventListener("canplaythrough", onCanPlayThrough);
    };
  }, [heroMedia?.mp4Url, heroMedia?.webmUrl, heroMedia?.posterUrl]);

  // Video Autoplay and Sound Unlocking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isSubscribed = true;

    const startAutoplay = async () => {
      try {
        video.muted = false;
        await video.play();
        if (isSubscribed) {
          setIsPlaying(true);
          setIsMuted(false);
          setAutoplayBlocked(false);
        }
      } catch {
        // Autoplay with sound was blocked, fallback to muted
        try {
          video.muted = true;
          await video.play();
          if (isSubscribed) {
            setIsPlaying(true);
            setIsMuted(true);
            setAutoplayBlocked(true);
          }
        } catch {
          // Play was interrupted or denied, ignore gracefully
        }
      }
    };

    startAutoplay();

    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (video && video.muted) {
        video.muted = false;
        setIsMuted(false);
        setAutoplayBlocked(false);
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchend", unlockAudio, { once: true });

    return () => {
      isSubscribed = false;
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
    };
  }, []);

  // IntersectionObserver: Pause when < 35% visible, resume when visible
  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) {
          if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
          }
        } else {
          // Wait for pending play request to complete before pausing to prevent AbortError
          if (!video.paused) {
            try {
              video.pause();
              setIsPlaying(false);
            } catch {}
          }
        }
      },
      { threshold: [0, 0.35, 1.0] }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Toggle sound manually
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
      setAutoplayBlocked(false);
      if (video.paused) video.play().catch(() => {});
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] w-full flex flex-col justify-between items-center pt-24 pb-12 px-[var(--gutter)] overflow-hidden"
    >
      {/* Ghost word: uppercase first name behind the person */}
      {features.showGhostWatermark !== false && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none -z-10 leading-none font-black text-center tracking-tighter"
          aria-hidden="true"
          style={{
            fontSize: "clamp(80px, 19vw, 310px)",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(13, 13, 13, 0.08)",
          }}
        >
          {PROFILE.firstName}
        </div>
      )}

      {/* Top micro kicker */}
      {features.showStatusBadge !== false && (
        <div className="rv is-in flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          {PROFILE.statusTag || "Available for Full-Stack Opportunities"}
        </div>
      )}

      {/* Center Hero Video (16:9 ratio) */}
      <div className="relative flex items-center justify-center my-auto w-full max-w-4xl px-2">
        <div
          className="relative w-full aspect-video flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: "16 / 9",
            maxHeight: "min(72svh, 680px)",
            maxWidth: "calc(min(72svh, 680px) * 16 / 9)",
          }}
        >
          <video
            ref={videoRef}
            loop
            playsInline
            preload="auto"
            poster={activeSources.poster}
            className="w-full h-full object-contain pointer-events-none select-none"
            style={{
              mixBlendMode: "multiply",
              filter: "contrast(1.03) brightness(1.01)",
            }}
          >
            {activeSources.webm && <source src={activeSources.webm} type="video/webm" />}
            {activeSources.mp4 && <source src={activeSources.mp4} type="video/mp4" />}
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>

          {/* Sound toggle button anchored inside 16:9 frame */}
          {features.enableSound !== false && (
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 pointer-events-auto">
              <button
                onClick={toggleSound}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                className="relative w-[44px] h-[44px] rounded-full bg-[#0d0d0d] text-[#f4f2ee] flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {/* Soft ping ring when autoplay is blocked */}
                {autoplayBlocked && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-black/20 pointer-events-none" />
                )}

                {isMuted ? (
                  /* ▶ Triangle (Sound off / Muted) */
                  <svg className="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  /* ❚❚ Two bars (Sound on) */
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Content: Role heading + Action CTAs */}
      <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center gap-6">
        {(() => {
          const rawRole = PROFILE.role || "Full Stack Developer";
          const parenMatch = rawRole.match(/^(.*?)\s*(\(.*?\))$/);
          const baseRole = parenMatch ? parenMatch[1] : rawRole;
          const tag = parenMatch ? parenMatch[2] : null;

          const words = baseRole.trim().split(/\s+/);
          const mainPart = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
          const lastWord = words.length > 1 ? words[words.length - 1] : "";

          return (
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0d0d0d] leading-[1.05]">
                {mainPart}{" "}
                {lastWord && (
                  <span className="font-serif-italic font-normal text-[#77756f]">
                    {lastWord.replace(/\.$/, "")}.
                  </span>
                )}
              </h1>
              {tag && (
                <div className="font-mono text-xs sm:text-sm text-[#77756f] tracking-widest uppercase">
                  {tag.replace(/[()]/g, "")}
                </div>
              )}
            </div>
          );
        })()}

        <p className="max-w-2xl text-sm sm:text-base text-[#77756f] font-normal leading-relaxed">
          {PROFILE.quote}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={() => scrollToTarget("#work")}
            className="btn-primary"
          >
            Explore work
          </button>
          <button
            onClick={() => scrollToTarget("#contact")}
            className="btn-secondary"
          >
            Let's talk
          </button>
          <a
            href={resume?.url || PROFILE.resumePath}
            download={resume?.downloadName || "Satyaranjan_Moharana_Resume.pdf"}
            className="btn-secondary font-mono text-xs tracking-wider uppercase"
          >
            Résumé ↓
          </a>
        </div>
      </div>
    </section>
  );
}
