/*
  Opt-in ambient sound layer for desktop visitors.
  Muted by default and safe to remove without affecting the static site.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopPointer = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches;
  if (reduceMotion || !desktopPointer || !("AudioContext" in window || "webkitAudioContext" in window)) return;

  const assetUrl = (window.CLOUDINARY_ASSETS?.ambientHum || "").trim();
  const storageKey = "csAmbientSound";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sound-toggle";
  button.setAttribute("aria-live", "polite");
  document.body.appendChild(button);

  let enabled = localStorage.getItem(storageKey) === "on";
  let audioContext;
  let humSource;
  let humGain;
  let tickGain;

  const setButton = () => {
    button.classList.toggle("active", enabled);
    button.textContent = enabled ? "Sound On" : "Sound Off";
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Turn ambient sound off" : "Turn ambient sound on");
  };

  const getContext = () => {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      audioContext = new Context();
      tickGain = audioContext.createGain();
      tickGain.gain.value = .035;
      tickGain.connect(audioContext.destination);
    }
    return audioContext;
  };

  const playAssetHum = async context => {
    if (!assetUrl || humSource) return;

    try {
      const response = await fetch(assetUrl);
      const buffer = await response.arrayBuffer();
      const decoded = await context.decodeAudioData(buffer);
      const source = context.createBufferSource();
      humGain = context.createGain();
      source.buffer = decoded;
      source.loop = true;
      humGain.gain.value = .028;
      source.connect(humGain);
      humGain.connect(context.destination);
      source.start();
      humSource = source;
    } catch {
      humSource = null;
    }
  };

  const stopHum = () => {
    if (!humSource) return;
    try {
      humSource.stop();
    } catch {}
    humSource.disconnect();
    humSource = null;
    humGain?.disconnect();
    humGain = null;
  };

  const ensureHum = async () => {
    if (!enabled) return;
    const context = getContext();
    if (context.state === "suspended") await context.resume();
    await playAssetHum(context);
  };

  const playTick = () => {
    if (!enabled || !audioContext || audioContext.state !== "running") return;
    const oscillator = audioContext.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(640, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(360, audioContext.currentTime + .075);
    oscillator.connect(tickGain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + .08);
  };

  button.addEventListener("click", async () => {
    enabled = !enabled;
    localStorage.setItem(storageKey, enabled ? "on" : "off");
    setButton();
    if (enabled) {
      await ensureHum();
    } else {
      stopHum();
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".pill.primary, .play-ring")) return;
    ensureHum();
    playTick();
  }, { capture: true });

  setButton();
})();
