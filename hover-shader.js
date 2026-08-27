/*
  Lightweight portfolio hover distortion layer.
  It draws animated projector-wave bands on a canvas overlay; remove this file to disable.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
  if (reduceMotion || !canHover) return;

  document.querySelectorAll(".project-card").forEach(card => {
    if (!card.querySelector(".project-video, .project-image")) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    canvas.className = "portfolio-hover-canvas";
    canvas.setAttribute("aria-hidden", "true");
    card.appendChild(canvas);

    let running = false;
    let raf = 0;

    const resize = () => {
      const rect = card.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = time => {
      if (!running) return;
      const { width, height } = card.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 10; i += 1) {
        const y = ((time * .035) + i * 34) % (height + 80) - 40;
        const x = Math.sin(time * .002 + i) * 18;
        const gradient = ctx.createLinearGradient(0, y, width, y + 24);
        gradient.addColorStop(0, "rgba(183,131,52,0)");
        gradient.addColorStop(.42, "rgba(183,131,52,.16)");
        gradient.addColorStop(.62, "rgba(125,33,23,.12)");
        gradient.addColorStop(1, "rgba(248,246,239,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, 18);
      }
      raf = requestAnimationFrame(draw);
    };

    card.addEventListener("mouseenter", () => {
      resize();
      running = true;
      card.classList.add("shader-hover");
      raf = requestAnimationFrame(draw);
    });

    card.addEventListener("mouseleave", () => {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      card.classList.remove("shader-hover");
    });
  });
})();
