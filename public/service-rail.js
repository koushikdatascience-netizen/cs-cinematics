/*
  Desktop-only drag rail for the Expertise section.
  Touch, mobile and reduced-motion visitors keep the plain service stack.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
  if (reduceMotion || !desktopPointer) return;

  const rail = document.getElementById("serviceRail");
  if (!rail) return;

  const section = rail.closest(".services-band");
  const previousButton = document.createElement("button");
  const nextButton = document.createElement("button");
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startScrollLeft = 0;
  let lastSample = { x: 0, time: 0 };
  let velocity = 0;
  let glideFrame = 0;

  previousButton.type = "button";
  previousButton.className = "service-rail-control service-rail-prev";
  previousButton.setAttribute("aria-label", "Show previous expertise services");
  previousButton.textContent = "<";

  nextButton.type = "button";
  nextButton.className = "service-rail-control service-rail-next";
  nextButton.setAttribute("aria-label", "Show next expertise services");
  nextButton.textContent = ">";

  rail.parentElement.append(previousButton, nextButton);

  const updateControls = () => {
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    previousButton.disabled = rail.scrollLeft <= 2;
    nextButton.disabled = rail.scrollLeft >= maxScroll - 2;
  };

  const scrollByCard = direction => {
    const card = rail.querySelector(".service-item");
    const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 18;
    const distance = card ? card.getBoundingClientRect().width + gap : rail.clientWidth * .8;
    rail.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const canScrollRail = delta => {
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const atStart = rail.scrollLeft <= 2;
    const atEnd = rail.scrollLeft >= maxScroll - 2;
    return !((delta < 0 && atStart) || (delta > 0 && atEnd));
  };

  const isSectionActive = () => {
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top <= 72 && rect.bottom >= window.innerHeight - 72;
  };

  const stopGlide = () => {
    if (!glideFrame) return;
    cancelAnimationFrame(glideFrame);
    glideFrame = 0;
  };

  const startGlide = () => {
    stopGlide();

    const glide = () => {
      rail.scrollLeft -= velocity * 16;
      velocity *= .92;

      if (Math.abs(velocity) < .05) {
        glideFrame = 0;
        return;
      }

      glideFrame = requestAnimationFrame(glide);
    };

    glideFrame = requestAnimationFrame(glide);
  };

  rail.addEventListener("wheel", event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    if (!canScrollRail(event.deltaY)) return;

    event.preventDefault();
    rail.scrollLeft += event.deltaY;
    updateControls();
  }, { passive: false });

  window.addEventListener("wheel", event => {
    if (!section || rail.contains(event.target) || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    if (!isSectionActive() || !canScrollRail(event.deltaY)) return;

    event.preventDefault();
    rail.scrollBy({ left: event.deltaY, behavior: "auto" });
    updateControls();
  }, { passive: false });

  rail.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;

    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    lastSample = { x: event.clientX, time: performance.now() };
    velocity = 0;
    stopGlide();
    rail.classList.add("is-grabbing");
    rail.setPointerCapture(pointerId);
  });

  rail.addEventListener("pointermove", event => {
    if (!dragging || event.pointerId !== pointerId) return;

    const now = performance.now();
    rail.scrollLeft = startScrollLeft - (event.clientX - startX);

    const elapsed = now - lastSample.time;
    if (elapsed > 0 && elapsed <= 100) {
      velocity = (event.clientX - lastSample.x) / elapsed;
    }

    lastSample = { x: event.clientX, time: now };
  });

  const release = event => {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    rail.classList.remove("is-grabbing");
    rail.releasePointerCapture(pointerId);
    pointerId = null;
    startGlide();
    updateControls();
  };

  rail.addEventListener("pointerup", release);
  rail.addEventListener("pointercancel", release);
  rail.addEventListener("lostpointercapture", () => {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    rail.classList.remove("is-grabbing");
    startGlide();
    updateControls();
  });

  previousButton.addEventListener("click", () => scrollByCard(-1));
  nextButton.addEventListener("click", () => scrollByCard(1));
  rail.addEventListener("scroll", updateControls, { passive: true });
  window.addEventListener("resize", updateControls, { passive: true });

  rail.querySelectorAll(".service-item").forEach(card => {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const animateTilt = () => {
      current.x += (target.x - current.x) * .12;
      current.y += (target.y - current.y) * .12;
      card.style.transform = `rotateX(${current.x}deg) rotateY(${current.y}deg)`;

      if (Math.abs(target.x - current.x) < .02 && Math.abs(target.y - current.y) < .02) {
        frame = 0;
        return;
      }

      frame = requestAnimationFrame(animateTilt);
    };

    const requestTilt = () => {
      if (!frame) frame = requestAnimationFrame(animateTilt);
    };

    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      target.x = y * -7;
      target.y = x * 7;
      requestTilt();
    });

    card.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
      requestTilt();
    });
  });

  updateControls();
})();
