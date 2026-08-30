/*
  Premium additive interaction layer.
  Safe to remove: the base HTML/CSS/JS remains functional without this file.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("enhanced");

  if (reduceMotion) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  const runHeroEntrance = () => {
    const theatre = document.querySelector(".theatre");
    const pieces = document.querySelectorAll(".theatre-arch, .aisle, .seat-row, .hero-copy > *");
    if (!theatre || !pieces.length || !("animate" in theatre)) return;

    theatre.animate([
      { opacity: .72, transform: "translateX(-50%) scale(1.018)", filter: "brightness(.7)" },
      { opacity: 1, transform: "translateX(-50%) scale(1)", filter: "brightness(1)" }
    ], {
      duration: 820,
      easing: "cubic-bezier(.2,.72,.16,1)",
      fill: "both"
    });

    pieces.forEach((piece, index) => {
      piece.animate([
        { opacity: 0, transform: `${getComputedStyle(piece).transform === "none" ? "" : getComputedStyle(piece).transform} translateY(${index % 2 ? 18 : 28}px)` },
        { opacity: 1, transform: getComputedStyle(piece).transform === "none" ? "translateY(0)" : getComputedStyle(piece).transform }
      ], {
        duration: 620,
        delay: 90 + index * 58,
        easing: "cubic-bezier(.2,.72,.16,1)",
        fill: "backwards"
      });
    });
  };

  const scheduleHeroEntrance = () => {
    window.setTimeout(runHeroEntrance, document.readyState === "loading" ? 180 : 80);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleHeroEntrance, { once: true });
  } else {
    scheduleHeroEntrance();
  }

  const counters = document.querySelectorAll(".stats-line strong");
  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const original = element.textContent.trim();
        const target = parseInt(original.replace(/\D/g, ""), 10);
        if (!target) return;
        const suffix = original.replace(/[0-9]/g, "");
        const start = performance.now();
        const duration = 900;

        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(element);
      });
    }, { threshold: 0.35 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  const marquee = document.querySelector(".marquee-track");
  if (marquee) {
    let lastY = window.scrollY;
    let skew = 0;
    const update = () => {
      const velocity = window.scrollY - lastY;
      lastY = window.scrollY;
      skew += (Math.max(Math.min(velocity * .04, 7), -7) - skew) * .08;
      marquee.style.transform = `skewX(${skew}deg)`;
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
})();
