/*
  Lazy Three.js hero scene: projector dust and aperture lines over the theatre.
  Remove this file to fall back to the original CSS theatre.
*/

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 6;
  const smallViewport = window.matchMedia("(max-width: 900px)").matches;
  const theatre = document.querySelector(".theatre");

  if (!theatre || reduceMotion || lowPower || smallViewport) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-webgl-canvas";
  canvas.setAttribute("aria-hidden", "true");
  theatre.appendChild(canvas);

  import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js").then(THREE => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    camera.position.z = 8;

    const dustCount = 900;
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      const p = i * 3;
      positions[p] = (Math.random() - .5) * 12;
      positions[p + 1] = (Math.random() - .5) * 5.5;
      positions[p + 2] = (Math.random() - .5) * 5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xd8ad6a,
      size: .025,
      transparent: true,
      opacity: .72,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(geometry, material);
    scene.add(dust);

    const ringGroup = new THREE.Group();
    for (let i = 0; i < 5; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.2 + i * .58, .006, 8, 112),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x7d2117 : 0xb78334, transparent: true, opacity: .22 })
      );
      ring.scale.y = .52;
      ring.position.y = .55;
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    const resize = () => {
      const rect = theatre.getBoundingClientRect();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };

    theatre.classList.add("webgl-ready");
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const animate = time => {
      const scroll = Math.min(window.scrollY / 900, 1);
      dust.rotation.y = time * .000035 + scroll * .18;
      dust.rotation.x = Math.sin(time * .00018) * .035;
      ringGroup.rotation.z = time * .00008 + scroll * .22;
      ringGroup.position.y = .35 - scroll * .32;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }).catch(() => {
    canvas.remove();
    theatre.classList.remove("webgl-ready");
  });
})();
