/*
  Showreel mask reveal on first play.
  Remove this file to keep the plain video start behavior.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const frame = document.querySelector(".reel-frame");
  const video = frame?.querySelector("video");
  if (!frame || !video) return;

  video.addEventListener("play", () => {
    frame.classList.remove("video-revealing");
    void frame.offsetWidth;
    frame.classList.add("video-revealing");
    window.setTimeout(() => frame.classList.remove("video-revealing"), 1050);
  });
})();
