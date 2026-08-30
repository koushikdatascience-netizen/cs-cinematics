window.CLOUDINARY_ASSETS = {
  // Paste Cloudinary delivery URLs here. Empty fields use temporary visual placeholders.
  // The site becomes production-real only after these image/video stills are filled.
  hero: "",
  showreel: "https://res.cloudinary.com/jpi9unmr/video/upload/f_auto,q_auto/v1785068174/lv_0_20260726173347_aqmf28.mp4",
  showreelPoster: "https://res.cloudinary.com/jpi9unmr/video/upload/w_640,f_auto,q_auto/v1785068174/lv_0_20260726173347_aqmf28.jpg",
  projectOne: "",
  projectTwo: "",
  projectThree: "",
  projectFour: "",
  projectFive: "",
  projectSix: "",
  projectSeven: "",
  projectEight: "",
  ambientHum: ""
};

const assets = window.CLOUDINARY_ASSETS;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".topbar");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

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

const archiveCards = Array.from(document.querySelectorAll(".project-card"));
const archiveMoreButton = document.querySelector("[data-archive-more]");
const archiveCount = document.querySelector("[data-archive-count]");
let activeArchiveFilter = "all";
let archiveVisibleLimit = 0;

const getArchiveStep = () => window.matchMedia("(max-width: 700px)").matches ? 6 : 8;

const updateArchiveGrid = ({ reset = false } = {}) => {
  const step = getArchiveStep();
  if (reset || !archiveVisibleLimit) archiveVisibleLimit = step;
  const previousRects = prefersReducedMotion ? new Map() : new Map(
    archiveCards
      .filter(card => !card.classList.contains("hidden"))
      .map(card => [card, card.getBoundingClientRect()])
  );

  const matchingCards = archiveCards.filter(card => (
    activeArchiveFilter === "all" || card.dataset.category === activeArchiveFilter
  ));

  archiveCards.forEach(card => {
    const matches = matchingCards.includes(card);
    const withinLimit = matchingCards.indexOf(card) < archiveVisibleLimit;
    card.classList.toggle("hidden", !matches || !withinLimit);
  });

  const shown = Math.min(archiveVisibleLimit, matchingCards.length);
  const remaining = Math.max(matchingCards.length - shown, 0);

  if (archiveCount) {
    archiveCount.textContent = matchingCards.length > step
      ? `Showing ${shown} of ${matchingCards.length} films`
      : `${matchingCards.length} films in this view`;
  }

  if (archiveMoreButton) {
    archiveMoreButton.hidden = remaining === 0;
    archiveMoreButton.textContent = remaining > step ? `Show next ${step}` : `Show ${remaining} more`;
  }

  window.syncProjectVideoPlayback?.();

  if (!prefersReducedMotion && previousRects.size) {
    requestAnimationFrame(() => {
      archiveCards.forEach(card => {
        if (card.classList.contains("hidden")) return;
        const previous = previousRects.get(card);
        if (!previous) return;

        const current = card.getBoundingClientRect();
        const deltaX = previous.left - current.left;
        const deltaY = previous.top - current.top;
        const scaleX = previous.width / current.width;
        const scaleY = previous.height / current.height;

        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1 && Math.abs(scaleX - 1) < .01 && Math.abs(scaleY - 1) < .01) return;

        card.animate([
          { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})` },
          { transform: "translate(0, 0) scale(1)" }
        ], {
          duration: 520,
          easing: "cubic-bezier(.2,.72,.16,1)"
        });
      });
    });
  }
};

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeArchiveFilter = button.dataset.filter;
    updateArchiveGrid({ reset: true });
  });
});

archiveMoreButton?.addEventListener("click", () => {
  archiveVisibleLimit += getArchiveStep();
  updateArchiveGrid();
});

window.addEventListener("resize", () => {
  updateArchiveGrid();
});

updateArchiveGrid({ reset: true });

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
  const supportsDialog = typeof HTMLDialogElement !== "undefined" && "showModal" in HTMLDialogElement.prototype;
  let lightboxDialog;
  let lightboxVideo;
  let lightboxTitle;
  let activeLightboxVideo;
  let previousActiveElement;

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

  const getVisibleProjectVideos = () => projectVideos.filter(video => {
    const card = video.closest(".project-card");
    return card && !card.classList.contains("hidden");
  });

  const createLightbox = () => {
    if (lightboxDialog || !supportsDialog) return lightboxDialog;

    lightboxDialog = document.createElement("dialog");
    lightboxDialog.className = "project-lightbox";
    lightboxDialog.setAttribute("aria-label", "Project video viewer");
    lightboxDialog.innerHTML = `
      <div class="project-lightbox-inner">
        <button class="project-lightbox-close" type="button" aria-label="Close video">Close</button>
        <video class="project-lightbox-video" controls playsinline preload="metadata"></video>
        <div class="project-lightbox-bar">
          <button class="project-lightbox-step" type="button" data-direction="-1" aria-label="Previous project">Prev</button>
          <p class="project-lightbox-title"></p>
          <button class="project-lightbox-step" type="button" data-direction="1" aria-label="Next project">Next</button>
        </div>
      </div>
    `;
    document.body.appendChild(lightboxDialog);
    lightboxVideo = lightboxDialog.querySelector(".project-lightbox-video");
    lightboxTitle = lightboxDialog.querySelector(".project-lightbox-title");

    const closeLightbox = () => lightboxDialog.close();

    lightboxDialog.querySelector(".project-lightbox-close").addEventListener("click", closeLightbox);
    lightboxDialog.addEventListener("click", event => {
      if (event.target === lightboxDialog) closeLightbox();
    });
    lightboxDialog.querySelectorAll("[data-direction]").forEach(button => {
      button.addEventListener("click", () => stepLightbox(Number(button.dataset.direction)));
    });
    lightboxDialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
    });
    lightboxDialog.addEventListener("close", () => {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxVideo.removeAttribute("poster");
      lightboxVideo.load();
      activeLightboxVideo = null;
      previousActiveElement?.focus?.();
      syncInlinePlayback();
    });

    return lightboxDialog;
  };

  const setLightboxVideo = video => {
    activeLightboxVideo = video;
    lightboxVideo.src = video.currentSrc || video.src;
    if (video.poster) lightboxVideo.poster = video.poster;
    lightboxVideo.muted = false;
    lightboxVideo.controls = true;
    lightboxTitle.textContent = video.closest(".project-card")?.querySelector("h3")?.textContent || "Project film";
    lightboxVideo.load();
    lightboxVideo.play().catch(() => {});
  };

  const stepLightbox = direction => {
    if (!activeLightboxVideo) return;
    const visibleProjectVideos = getVisibleProjectVideos();
    const currentIndex = visibleProjectVideos.indexOf(activeLightboxVideo);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + visibleProjectVideos.length) % visibleProjectVideos.length;
    setLightboxVideo(visibleProjectVideos[nextIndex]);
  };

  const openLightbox = video => {
    if (!supportsDialog) {
      openFullscreen(video);
      return;
    }

    createLightbox();
    previousActiveElement = document.activeElement;
    projectVideos.forEach(item => {
      item.muted = true;
      item.controls = false;
      item.pause();
    });
    setLightboxVideo(video);
    if (!lightboxDialog.open) lightboxDialog.showModal();
  };

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
      openLightbox(video);
    };

    fullscreenControl.addEventListener("click", triggerFullscreen);
    card.addEventListener("click", event => {
      if (event.target.closest("button, a")) return;
      openLightbox(video);
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
