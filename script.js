window.CLOUDINARY_ASSETS = {
  // Paste Cloudinary delivery URLs here. Empty fields use temporary visual placeholders.
  // The site becomes production-real only after these image/video stills are filled.
  hero: "",
  showreel: "https://res.cloudinary.com/jpi9unmr/video/upload/f_auto,q_auto/v1785068174/lv_0_20260726173347_aqmf28.mp4",
  showreelPoster: "https://res.cloudinary.com/jpi9unmr/video/upload/h_720,q_auto/v1785068174/lv_0_20260726173347_aqmf28.jpg",
  projectOne: "",
  projectTwo: "",
  projectThree: "",
  projectFour: "",
  projectFive: "",
  projectSix: "",
  projectSeven: "",
  projectEight: ""
};

const assets = window.CLOUDINARY_ASSETS;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const modeContent = {
  rhythm: {
    label: "Retention Cut",
    title: "Impact beats arranged to hold attention.",
    copy: "Hooks, pauses, speed ramps and sound hits are mapped into a clean timeline before final polish."
  },
  grade: {
    label: "Color System",
    title: "A signature grade built frame by frame.",
    copy: "Contrast, warmth, skin tone and highlight rolloff are shaped until the image feels expensive without feeling artificial."
  },
  motion: {
    label: "Motion Design",
    title: "Titles, texture and graphics that move with intent.",
    copy: "Kinetic type, tracking elements and graphic accents are timed to the edit instead of sitting on top of it."
  }
};
const header = document.querySelector(".topbar");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", event => {
    document.body.style.setProperty("--spot-x", `${event.clientX}px`);
    document.body.style.setProperty("--spot-y", `${event.clientY}px`);
  });
}

menuButton.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuButton.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

mobileNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    const category = button.dataset.filter;
    document.querySelectorAll(".project-card").forEach(card => {
      card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category);
    });
    window.syncProjectVideoPlayback?.();
  });
});

document.querySelectorAll(".mode-tab").forEach(button => {
  button.addEventListener("click", () => {
    const selected = modeContent[button.dataset.mode];
    if (!selected) return;

    document.querySelectorAll(".mode-tab").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector("[data-mode-label]").textContent = selected.label;
    document.querySelector("[data-mode-title]").textContent = selected.title;
    document.querySelector("[data-mode-copy]").textContent = selected.copy;
  });
});

const gradeSlider = document.querySelector(".grade-slider");
const gradeBefore = document.querySelector("[data-grade-before]");

if (gradeSlider && gradeBefore) {
  const syncGrade = () => {
    gradeBefore.style.width = `${gradeSlider.value}%`;
  };

  gradeSlider.addEventListener("input", syncGrade);
  syncGrade();
}

if (prefersReducedMotion) {
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
}
document.getElementById("year").textContent = new Date().getFullYear();

function applyCloudinaryAssets() {
  document.querySelectorAll("[data-asset-bg]").forEach(element => {
    const key = element.dataset.assetBg;
    const url = (assets[key] || "").trim();

    if (url) {
      element.style.backgroundImage = `linear-gradient(180deg, transparent 0 44%, rgba(0,0,0,.78) 100%), url("${url}")`;
    }
  });

  const showreel = document.querySelector('[data-asset-video="showreel"]');
  const showreelUrl = (assets.showreel || "").trim();
  const posterUrl = (assets.showreelPoster || "").trim();

  if (showreel && showreelUrl) {
    showreel.src = showreelUrl;
    showreel.controls = false;
    if (posterUrl) showreel.poster = posterUrl;
    showreel.load();
  }
}

applyCloudinaryAssets();

function enhanceProjectVideos() {
  const projectVideos = Array.from(document.querySelectorAll(".project-video"));
  const loopDelay = 2400;
  const visibleVideos = new Set();

  const isFullscreenVideo = video => (
    document.fullscreenElement === video ||
    document.webkitFullscreenElement === video
  );

  const shouldPlayInline = video => {
    const card = video.closest(".project-card");
    return card && !card.classList.contains("hidden") && visibleVideos.has(video) && !document.fullscreenElement && !document.webkitFullscreenElement;
  };

  const syncInlinePlayback = () => {
    projectVideos.forEach(video => {
      if (isFullscreenVideo(video)) return;

      video.muted = true;
      video.controls = false;

      if (shouldPlayInline(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  window.syncProjectVideoPlayback = syncInlinePlayback;

  const exitFullscreen = () => {
    const activeVideo = projectVideos.find(video => (
      document.fullscreenElement === video ||
      document.webkitFullscreenElement === video
    ));

    projectVideos.forEach(video => {
      const isActive = video === activeVideo;
      video.muted = !isActive;
      video.controls = isActive;
      if (isActive) video.play().catch(() => {});
    });

    if (!activeVideo) syncInlinePlayback();
  };

  const openFullscreen = video => {
    projectVideos.forEach(item => {
      if (item !== video) {
        item.muted = true;
        item.controls = false;
        item.pause();
      }
    });

    video.muted = false;
    video.controls = true;
    video.play().catch(() => {});

    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {
        video.muted = true;
        video.controls = false;
      });
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  };

  projectVideos.forEach(video => {
    const card = video.closest(".project-card");
    if (!card) return;

    video.loop = false;
    video.removeAttribute("loop");
    video.removeAttribute("autoplay");
    video.muted = true;
    video.controls = false;
    video.playsInline = true;
    card.classList.add("has-video");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Watch ${card.querySelector("h3")?.textContent || "project"} fullscreen`);

    const fullscreenControl = document.createElement("button");
    fullscreenControl.type = "button";
    fullscreenControl.className = "project-fullscreen";
    fullscreenControl.setAttribute("aria-label", "Open fullscreen with audio");
    fullscreenControl.title = "Fullscreen";
    card.appendChild(fullscreenControl);

    const triggerFullscreen = event => {
      event.preventDefault();
      event.stopPropagation();
      openFullscreen(video);
    };

    fullscreenControl.addEventListener("click", triggerFullscreen);
    card.addEventListener("click", event => {
      if (event.target.closest("button")) return;
      openFullscreen(video);
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        triggerFullscreen(event);
      }
    });

    video.addEventListener("ended", () => {
      window.setTimeout(() => {
        video.currentTime = 0;
        if (isFullscreenVideo(video) || shouldPlayInline(video)) video.play().catch(() => {});
      }, loopDelay);
    });

    video.addEventListener("webkitendfullscreen", () => {
      video.muted = true;
      video.controls = false;
      syncInlinePlayback();
    });
  });

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          visibleVideos.add(video);
        } else {
          visibleVideos.delete(video);
        }
      });
      syncInlinePlayback();
    }, { rootMargin: "180px 0px", threshold: 0.18 });

    projectVideos.forEach(video => videoObserver.observe(video));
  } else {
    projectVideos.forEach(video => visibleVideos.add(video));
    syncInlinePlayback();
  }

  document.addEventListener("fullscreenchange", exitFullscreen);
  document.addEventListener("webkitfullscreenchange", exitFullscreen);
}

enhanceProjectVideos();

const reelButton = document.querySelector(".reel-frame");
const reelVideo = document.querySelector('[data-asset-video="showreel"]');
const playButton = document.querySelector(".play-ring");
const fullscreenButton = document.querySelector(".fullscreen-button");

if (reelButton && reelVideo) {
  reelVideo.muted = true;
  reelVideo.controls = false;

  const setReelState = playing => {
    reelButton.classList.toggle("playing", playing);
    if (playButton) {
      playButton.textContent = playing ? "Pause" : "Play";
      playButton.setAttribute("aria-label", playing ? "Pause showreel" : "Play showreel");
      playButton.setAttribute("aria-pressed", String(playing));
    }
  };

  const toggleReel = () => {
    if (!reelVideo.src) return;

    if (reelVideo.paused) {
      reelVideo.play();
    } else {
      reelVideo.pause();
    }
  };

  playButton?.addEventListener("click", event => {
    event.stopPropagation();
    toggleReel();
  });

  reelVideo.addEventListener("click", toggleReel);
  reelButton.addEventListener("click", event => {
    if (event.target === reelButton) toggleReel();
  });

  reelVideo.addEventListener("play", () => setReelState(true));
  reelVideo.addEventListener("pause", () => setReelState(false));
  reelVideo.addEventListener("ended", () => setReelState(false));

  fullscreenButton?.addEventListener("click", event => {
    event.stopPropagation();
    const target = reelVideo.requestFullscreen ? reelVideo : reelButton;

    reelVideo.muted = false;
    reelVideo.controls = true;
    reelVideo.play().catch(() => {});

    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {
        reelVideo.muted = true;
        reelVideo.controls = false;
      });
    } else if (reelVideo.webkitEnterFullscreen) {
      reelVideo.webkitEnterFullscreen();
    }
  });

  const syncReelFullscreenAudio = () => {
    const isFullscreen = (
      document.fullscreenElement === reelVideo ||
      document.fullscreenElement === reelButton ||
      document.webkitFullscreenElement === reelVideo ||
      document.webkitFullscreenElement === reelButton
    );

    reelVideo.muted = !isFullscreen;
    reelVideo.controls = isFullscreen;
    if (isFullscreen) reelVideo.play().catch(() => {});
  };

  reelVideo.addEventListener("webkitendfullscreen", () => {
    reelVideo.muted = true;
    reelVideo.controls = false;
  });
  document.addEventListener("fullscreenchange", syncReelFullscreenAudio);
  document.addEventListener("webkitfullscreenchange", syncReelFullscreenAudio);

  setReelState(false);
}
