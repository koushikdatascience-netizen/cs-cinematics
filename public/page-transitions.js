/*
  Static-page iris transition for internal navigation.
  Remove this file to restore ordinary hard navigations.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const overlay = document.createElement("div");
  overlay.className = "cs-transition";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  const prepareProjectTransition = link => {
    const card = link.closest(".project-card");
    const media = card?.querySelector(".project-video, .project-image");
    if (!card || !media) return false;

    const transitionName = `project-${link.pathname.replace(/[^a-z0-9]/gi, "-").replace(/^-|-$/g, "")}`;
    media.style.viewTransitionName = transitionName;
    sessionStorage.setItem("csProjectTransition", transitionName);
    return true;
  };

  const applyIncomingProjectTransition = () => {
    if (!document.startViewTransition) return;
    const transitionName = sessionStorage.getItem("csProjectTransition");
    if (!transitionName) return;

    const heroVideo = document.querySelector(".watch-video");
    if (!heroVideo) {
      sessionStorage.removeItem("csProjectTransition");
      return;
    }

    heroVideo.style.viewTransitionName = transitionName;
    window.setTimeout(() => {
      heroVideo.style.viewTransitionName = "";
      sessionStorage.removeItem("csProjectTransition");
    }, 1200);
  };

  applyIncomingProjectTransition();

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== "_self") return;

    const url = new URL(link.href, window.location.href);
    const samePageHash = url.pathname === window.location.pathname && url.hash;
    if (url.origin !== window.location.origin || samePageHash || link.hasAttribute("download")) return;

    event.preventDefault();
    const isProjectLink = prepareProjectTransition(link);

    if (isProjectLink) {
      window.location.href = url.href;
      return;
    }

    overlay.classList.add("is-active");
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 430);
  });
})();
