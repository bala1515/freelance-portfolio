import React, { useEffect, useRef, useState } from "react";

export default function FallingEmployee({
  replay,
  paused,
  reducedMotion,
  onPhase,
}) {
  const host = useRef(null);
  const controls = useRef(null);
  const phaseCallback = useRef(onPhase);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    phaseCallback.current = onPhase;
  }, [onPhase]);
  useEffect(() => {
    controls.current?.restart();
  }, [replay]);
  useEffect(() => {
    controls.current?.pause(paused);
  }, [paused]);
  useEffect(() => {
    let disposed = false;
    let teardown = () => {};
    setFailed(false);
    Promise.all([import("three"), import("../lib/portfolio-character")])
      .then(([THREE, { createEmployee }]) => {
        if (disposed || !host.current) return;
        const container = host.current;
        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          });
        } catch {
          setFailed(true);
          phaseCallback.current("ready");
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute("aria-hidden", "true");
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
        camera.position.set(0, 2.25, 7.9);
        camera.lookAt(0, 1.76, 0);
        scene.add(new THREE.HemisphereLight("#fff7ec", "#aca1bb", 2.3));
        const key = new THREE.DirectionalLight("#fff3df", 4.2);
        key.position.set(-3, 6, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = -4;
        key.shadow.camera.right = 4;
        key.shadow.camera.top = 6;
        key.shadow.camera.bottom = -4;
        key.shadow.bias = -0.0005;
        key.shadow.normalBias = 0.02;
        key.shadow.radius = 4;
        scene.add(key);
        const rim = new THREE.DirectionalLight("#cfc4ff", 3);
        rim.position.set(3, 4, -2);
        scene.add(rim);
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 30),
          new THREE.ShadowMaterial({ opacity: 0.12 }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        floor.receiveShadow = true;
        scene.add(floor);
        const contactCanvas = document.createElement("canvas");
        contactCanvas.width = 128;
        contactCanvas.height = 128;
        const context = contactCanvas.getContext("2d");
        const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 60);
        gradient.addColorStop(0, "rgba(55,38,65,0.32)");
        gradient.addColorStop(1, "rgba(55,38,65,0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);
        const contactTexture = new THREE.CanvasTexture(contactCanvas);
        const contact = new THREE.Mesh(
          new THREE.PlaneGeometry(2.6, 1.5),
          new THREE.MeshBasicMaterial({
            map: contactTexture,
            transparent: true,
            depthWrite: false,
          }),
        );
        contact.rotation.x = -Math.PI / 2;
        contact.position.y = 0.018;
        scene.add(contact);
        const character = createEmployee();
        scene.add(character.root);
        let elapsed = reducedMotion ? 4.6 : 0,
          previous = 0,
          lastRendered = 0,
          isPaused = paused,
          inView = true,
          phase = "",
          scroll = 0;
        const pointer = new THREE.Vector2();
        const currentPointer = new THREE.Vector2();
        const setPhase = (value) => {
          if (value !== phase) {
            phase = value;
            phaseCallback.current(value);
          }
        };
        const smooth = (v) => {
          const t = Math.max(0, Math.min(1, v));
          return t * t * (3 - 2 * t);
        };
        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.position.z = width / height < 0.75 ? 9.2 : 7.9;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();
        const pointerMove = (event) => {
          const rect = container.getBoundingClientRect();
          pointer.set(
            (event.clientX - rect.left) / rect.width - 0.5,
            (event.clientY - rect.top) / rect.height - 0.5,
          );
        };
        const pointerLeave = () => pointer.set(0, 0);
        container.addEventListener("pointermove", pointerMove);
        container.addEventListener("pointerleave", pointerLeave);
        const onScroll = () => {
          const hero = container.closest(".bb-hero");
          if (hero)
            scroll = Math.max(
              0,
              Math.min(
                1,
                -hero.getBoundingClientRect().top / hero.offsetHeight,
              ),
            );
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        const render = (time) => {
          if (disposed) return;
          if (!inView || document.hidden) {
            previous = time;
            return;
          }
          if (time - lastRendered < 30) return;
          const delta = previous ? Math.min((time - previous) / 1000, 0.06) : 0;
          previous = time;
          lastRendered = time;
          if (!isPaused && !reducedMotion) elapsed += delta;
          const t = elapsed;
          const falling = t < 1.85;
          const settling = smooth((t - 1.85) / 1.1);
          const reveal = smooth((t - 2.8) / 0.7);
          setPhase(t < 1.85 ? "falling" : t < 2.8 ? "landing" : "ready");
          const drop = Math.min(t / 1.85, 1);
          const bounce =
            t >= 1.85
              ? Math.abs(Math.sin((t - 1.85) * 8)) *
                Math.exp(-(t - 1.85) * 3) *
                0.4
              : 0;
          character.root.position.y = falling
            ? 6.5 * (1 - drop * drop)
            : bounce + (!reducedMotion ? Math.sin(t * 1.7) * 0.012 : 0);
          character.root.position.x = falling ? Math.sin(t * 4) * 0.2 : 0;
          character.root.rotation.z = falling
            ? Math.sin(t * 8) * 0.18
            : (1 - settling) * Math.sin(t * 7) * 0.1;
          character.root.rotation.y = falling
            ? Math.sin(t * 5) * 0.35
            : 0.18 + currentPointer.x * 0.16;
          character.body.rotation.x = falling ? -0.1 : 0;
          character.head.rotation.z = falling ? Math.sin(t * 9) * 0.1 : -0.035;
          currentPointer.lerp(pointer, 0.07);
          character.head.rotation.y = currentPointer.x * 0.22 * settling;
          character.head.rotation.x = currentPointer.y * 0.12 * settling;
          character.root.position.y += reducedMotion ? 0 : scroll * 0.25;
          character.arms.forEach(({ arm, elbow, hand, side }, i) => {
            const fright = side * (2.25 + Math.sin(t * 17 + i) * 0.3);
            const rest =
              side * (0.18 + (i === 1 ? Math.sin(t * 2) * 0.035 : 0));
            arm.rotation.z = falling
              ? fright
              : THREE.MathUtils.lerp(fright, rest, settling);
            arm.rotation.x = falling ? Math.sin(t * 14 + i) * 0.35 : -0.12;
            elbow.rotation.x = falling
              ? -0.5 + Math.sin(t * 18 + i) * 0.3
              : -0.16;
            hand.rotation.z = falling ? Math.sin(t * 23 + i) * 0.25 : 0;
          });
          character.legs.forEach(({ leg, knee, side }, i) => {
            leg.rotation.z = falling
              ? side * (0.4 + Math.sin(t * 13 + i) * 0.2)
              : side * 0.04;
            leg.rotation.x = falling ? Math.sin(t * 14 + i * 2) * 0.5 : 0;
            knee.rotation.x = falling
              ? 0.4 + Math.sin(t * 13 + i) * 0.25
              : -(1 - settling) * 0.15;
          });
          character.tie.rotation.x = falling
            ? -1.1 + Math.sin(t * 15) * 0.4
            : Math.sin(t * 4) * 0.08 * (1 - settling);
          character.badge.rotation.x = falling
            ? -1.3 + Math.sin(t * 17) * 0.55
            : Math.sin((t - 1.85) * 10) *
              Math.exp(-Math.max(0, t - 1.85) * 1.1) *
              0.6;
          character.badge.rotation.z = falling
            ? Math.sin(t * 12) * 0.35
            : Math.sin(t * 4) * 0.04 * (1 - reveal);
          character.mouth.visible = t < 2.8;
          character.smile.visible = t >= 2.8;
          character.brows.forEach((brow, i) => {
            brow.rotation.z =
              Math.PI / 2 + (i === 0 ? 1 : -1) * (falling ? 0.38 : 0.08);
          });
          const blink =
            !falling && !reducedMotion && Math.sin(t * 1.1) > 0.995 ? 0.15 : 1;
          character.eyes.forEach((eye) => (eye.scale.y = blink));
          contact.scale.setScalar(falling ? 0.65 + 0.35 * drop : 1);
          contact.material.opacity = falling ? drop : 0.9;
          renderer.render(scene, camera);
        };
        const visibility = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            previous = 0;
          },
          { threshold: 0.01 },
        );
        visibility.observe(container);
        const contextLost = (event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          setFailed(true);
          setPhase("ready");
        };
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        controls.current = {
          restart() {
            elapsed = reducedMotion ? 4.6 : 0;
            previous = 0;
            phase = "";
          },
          pause(value) {
            isPaused = value;
            previous = 0;
          },
        };
        renderer.setAnimationLoop(render);
        teardown = () => {
          controls.current = null;
          renderer.setAnimationLoop(null);
          observer.disconnect();
          visibility.disconnect();
          container.removeEventListener("pointermove", pointerMove);
          container.removeEventListener("pointerleave", pointerLeave);
          window.removeEventListener("scroll", onScroll);
          renderer.domElement.removeEventListener(
            "webglcontextlost",
            contextLost,
          );
          const geometries = new Set(),
            materials = new Set(),
            textures = new Set();
          scene.traverse((object) => {
            if (object.geometry) geometries.add(object.geometry);
            if (object.material) {
              for (const material of Array.isArray(object.material)
                ? object.material
                : [object.material]) {
                materials.add(material);
                if (material.map) textures.add(material.map);
              }
            }
          });
          geometries.forEach((g) => g.dispose());
          textures.forEach((t) => t.dispose());
          materials.forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
          phaseCallback.current("ready");
        }
      });
    return () => {
      disposed = true;
      teardown();
    };
  }, [reducedMotion]);
  return (
    <div
      className="bb-character-canvas"
      ref={host}
      role="img"
      aria-label="An animated 3D developer with glasses and a Bala ID card, falling into the page and landing on his feet."
    >
      {failed && (
        <div className="bb-character-fallback">
          <span className="bb-fallback-mark">b.</span>
          <strong>Bala</strong>
          <span>Developer. Problem solver.</span>
          <small>Good ideas always find their feet.</small>
        </div>
      )}
    </div>
  );
}
