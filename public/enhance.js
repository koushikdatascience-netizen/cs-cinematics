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
