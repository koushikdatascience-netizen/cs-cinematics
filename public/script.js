window.CLOUDINARY_ASSETS = {
  // Paste Cloudinary delivery URLs here. Empty fields use temporary visual placeholders.
  // The site becomes production-real only after these image/video stills are filled.
  hero: "",
  showreel: "",
  showreelPoster: "",
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

const reelButton = document.querySelector(".reel-frame");
const reelVideo = document.querySelector('[data-asset-video="showreel"]');

if (reelButton && reelVideo) {
  reelButton.addEventListener("click", () => {
    if (!reelVideo.src) return;

    if (reelVideo.paused) {
      reelVideo.play();
      reelButton.classList.add("playing");
    } else {
      reelVideo.pause();
      reelButton.classList.remove("playing");
    }
  });
}
