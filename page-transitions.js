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

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== "_self") return;

    const url = new URL(link.href, window.location.href);
    const samePageHash = url.pathname === window.location.pathname && url.hash;
    if (url.origin !== window.location.origin || samePageHash || link.hasAttribute("download")) return;

    event.preventDefault();
    overlay.classList.add("is-active");
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 430);
  });
})();
