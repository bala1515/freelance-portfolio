import React, { useEffect, useRef, useState } from "react";

export default function HeroWorkspace({
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
    controls.current?.pulse();
  }, [replay]);

  useEffect(() => {
    controls.current?.pause(paused);
  }, [paused]);

  useEffect(() => {
    let disposed = false;
    let teardown = () => {};
    setFailed(false);

    Promise.all([
      import("three"),
      import("three/addons/geometries/RoundedBoxGeometry.js"),
    ])
      .then(([THREE, { RoundedBoxGeometry }]) => {
        if (disposed || !host.current) return;
        const container = host.current;

        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          });
        } catch {
          setFailed(true);
          phaseCallback.current?.("ready");
          return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.style.cursor = "grab";
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
        camera.position.set(0, 2.5, 8.4);
        camera.lookAt(0, 1.25, 0);

        // Lighting
        const hemiLight = new THREE.HemisphereLight("#fff7ee", "#2e2136", 2.2);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight("#fff4e6", 3.8);
        keyLight.position.set(-4, 7, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.bias = -0.0004;
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight("#a99ed8", 2.6);
        rimLight.position.set(4, 4, -3);
        scene.add(rimLight);

        const screenLight = new THREE.PointLight("#e4fb92", 1.8, 4.5);
        screenLight.position.set(0, 1.5, 0.6);
        scene.add(screenLight);

        // Floor shadow
        const floorCanvas = document.createElement("canvas");
        floorCanvas.width = 256;
        floorCanvas.height = 256;
        const fctx = floorCanvas.getContext("2d");
        const fgrad = fctx.createRadialGradient(128, 128, 10, 128, 128, 120);
        fgrad.addColorStop(0, "rgba(41, 35, 46, 0.35)");
        fgrad.addColorStop(0.5, "rgba(41, 35, 46, 0.15)");
        fgrad.addColorStop(1, "rgba(41, 35, 46, 0)");
        fctx.fillStyle = fgrad;
        fctx.fillRect(0, 0, 256, 256);

        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        const floorShadow = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 2.8),
          new THREE.MeshBasicMaterial({
            map: floorTexture,
            transparent: true,
            depthWrite: false,
          }),
        );
        floorShadow.rotation.x = -Math.PI / 2;
        floorShadow.position.set(0, 0.05, 0);
        scene.add(floorShadow);

        // Main scene pivot group
        const mainPivot = new THREE.Group();
        mainPivot.position.set(0, 1.3, 0);
        scene.add(mainPivot);

        // ----------------- LAPTOP MODEL -----------------
        const laptopGroup = new THREE.Group();
        mainPivot.add(laptopGroup);

        const bodyDark = new THREE.MeshStandardMaterial({
          color: "#211a27",
          metalness: 0.65,
          roughness: 0.32,
        });

        const keyboardPlateMat = new THREE.MeshStandardMaterial({
          color: "#151119",
          metalness: 0.4,
          roughness: 0.5,
        });

        const keyMat = new THREE.MeshStandardMaterial({
          color: "#2f2736",
          metalness: 0.5,
          roughness: 0.4,
        });

        const trackpadMat = new THREE.MeshStandardMaterial({
          color: "#2a2232",
          metalness: 0.7,
          roughness: 0.25,
        });

        const limeEmissive = new THREE.MeshStandardMaterial({
          color: "#e4fb92",
          emissive: "#b8d956",
          emissiveIntensity: 1.2,
          roughness: 0.2,
        });

        // Base
        const laptopBase = new THREE.Mesh(
          new RoundedBoxGeometry(2.35, 0.08, 1.62, 3, 0.035),
          bodyDark,
        );
        laptopBase.castShadow = true;
        laptopBase.receiveShadow = true;
        laptopGroup.add(laptopBase);

        // Keyboard recess
        const kbRecess = new THREE.Mesh(
          new RoundedBoxGeometry(2.12, 0.02, 0.88, 2, 0.02),
          keyboardPlateMat,
        );
        kbRecess.position.set(0, 0.042, -0.22);
        laptopGroup.add(kbRecess);

        // Key rows
        for (let r = 0; r < 4; r++) {
          const keysInRow = 10;
          for (let c = 0; c < keysInRow; c++) {
            const kw = 0.17;
            const kd = 0.15;
            const kx = (c - (keysInRow - 1) / 2) * 0.205;
            const kz = -0.48 + r * 0.18;
            const key = new THREE.Mesh(
              new RoundedBoxGeometry(kw, 0.025, kd, 1, 0.01),
              keyMat,
            );
            key.position.set(kx, 0.05, kz);
            laptopGroup.add(key);
          }
        }

        // Trackpad
        const trackpad = new THREE.Mesh(
          new RoundedBoxGeometry(0.72, 0.015, 0.46, 2, 0.02),
          trackpadMat,
        );
        trackpad.position.set(0, 0.045, 0.45);
        laptopGroup.add(trackpad);

        // Indicator LED
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 12, 12),
          limeEmissive,
        );
        led.position.set(1.05, 0.045, 0.75);
        laptopGroup.add(led);

        // Screen Lid Group
        const lidGroup = new THREE.Group();
        lidGroup.position.set(0, 0.04, -0.81);
        laptopGroup.add(lidGroup);
        // Tilt open by ~108 degrees
        lidGroup.rotation.x = Math.PI * 0.09;

        const lidBack = new THREE.Mesh(
          new RoundedBoxGeometry(2.35, 1.54, 0.05, 3, 0.035),
          bodyDark,
        );
        lidBack.position.set(0, 0.77, 0);
        lidBack.castShadow = true;
        lidGroup.add(lidBack);

        // Animated Screen Code Texture
        const screenCanvas = document.createElement("canvas");
        screenCanvas.width = 640;
        screenCanvas.height = 420;
        const sctx = screenCanvas.getContext("2d");

        const codeLines = [
          { text: "// Built by Bala — Independent Developer", color: "#8a7c93" },
          { text: "import { ideas, build } from 'bala';", color: "#c084fc" },
          { text: "", color: "#fff" },
          { text: "const workspace = {", color: "#38bdf8" },
          { text: "  client: 'Your next ambitious idea',", color: "#e4fb92" },
          { text: "  stack: ['Rails', 'React', 'Tailwind'],", color: "#f472b6" },
          { text: "  shipping: 'Fast, responsive, thoughtful',", color: "#fef08a" },
          { text: "  status: 'Ready to build ✳',", color: "#4ade80" },
          { text: "};", color: "#38bdf8" },
          { text: "", color: "#fff" },
          { text: "export default async function ship() {", color: "#c084fc" },
          { text: "  await makeItClick(workspace);", color: "#e4fb92" },
          { text: "  return 'Shipped with care 🚀';", color: "#38bdf8" },
          { text: "}", color: "#c084fc" },
        ];

        let cursorVisible = true;
        let lastBlink = 0;

        const drawScreen = (time) => {
          if (time - lastBlink > 500) {
            cursorVisible = !cursorVisible;
            lastBlink = time;
          }

          // Screen background
          sctx.fillStyle = "#120e17";
          sctx.fillRect(0, 0, 640, 420);

          // Top window bar
          sctx.fillStyle = "#1c1624";
          sctx.fillRect(0, 0, 640, 36);

          // Window control dots
          sctx.fillStyle = "#ff5f56";
          sctx.beginPath();
          sctx.arc(22, 18, 6, 0, Math.PI * 2);
          sctx.fill();

          sctx.fillStyle = "#ffbd2e";
          sctx.beginPath();
          sctx.arc(42, 18, 6, 0, Math.PI * 2);
          sctx.fill();

          sctx.fillStyle = "#27c93f";
          sctx.beginPath();
          sctx.arc(62, 18, 6, 0, Math.PI * 2);
          sctx.fill();

          // Tab
          sctx.fillStyle = "#120e17";
          sctx.beginPath();
          sctx.roundRect(85, 6, 170, 30, [6, 6, 0, 0]);
          sctx.fill();

          sctx.font = "bold 12px monospace";
          sctx.fillStyle = "#e4fb92";
          sctx.fillText("b.", 98, 24);
          sctx.fillStyle = "#d1c7dc";
          sctx.font = "12px system-ui, sans-serif";
          sctx.fillText("workspace.jsx", 118, 24);

          // Code lines
          sctx.font = "15px 'Courier New', Courier, monospace";
          const startY = 70;
          const lineHeight = 22;

          for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            const y = startY + i * lineHeight;
            if (y > 380) break;

            // Line numbers
            sctx.fillStyle = "#534859";
            sctx.textAlign = "right";
            sctx.fillText(String(i + 1), 35, y);

            // Code text
            sctx.textAlign = "left";
            sctx.fillStyle = line.color;
            sctx.fillText(line.text, 50, y);

            if (i === 12 && cursorVisible) {
              const textWidth = sctx.measureText(line.text).width;
              sctx.fillStyle = "#e4fb92";
              sctx.fillRect(52 + textWidth, y - 13, 8, 16);
            }
          }

          // Bottom status bar
          sctx.fillStyle = "#1a1421";
          sctx.fillRect(0, 396, 640, 24);
          sctx.font = "11px system-ui, sans-serif";
          sctx.fillStyle = "#7e7087";
          sctx.textAlign = "left";
          sctx.fillText("UTF-8   ·   Git: main ✓   ·   Built by Bala", 18, 412);
          sctx.textAlign = "right";
          sctx.fillStyle = "#e4fb92";
          sctx.fillText("● Ready", 620, 412);
        };

        drawScreen(0);
        const screenTexture = new THREE.CanvasTexture(screenCanvas);
        screenTexture.colorSpace = THREE.SRGBColorSpace;

        const screenMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2.24, 1.44),
          new THREE.MeshBasicMaterial({
            map: screenTexture,
          }),
        );
        screenMesh.position.set(0, 0.77, 0.03);
        lidGroup.add(screenMesh);

        // ----------------- ORBITING 3D TECH TOKENS -----------------
        const orbitsGroup = new THREE.Group();
        mainPivot.add(orbitsGroup);

        // Guide orbital rings
        const ringMat = new THREE.MeshBasicMaterial({
          color: "#9a8da2",
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
        });

        const ring1 = new THREE.Mesh(
          new THREE.RingGeometry(2.2, 2.22, 64),
          ringMat,
        );
        ring1.rotation.x = Math.PI / 2.3;
        ring1.position.y = 0.2;
        orbitsGroup.add(ring1);

        const ring2 = new THREE.Mesh(
          new THREE.RingGeometry(2.7, 2.72, 64),
          ringMat,
        );
        ring2.rotation.x = Math.PI / 2.1;
        ring2.rotation.y = 0.2;
        ring2.position.y = 0.45;
        orbitsGroup.add(ring2);

        // Tech Token 1: React Atom
        const reactToken = new THREE.Group();
        const reactCore = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshStandardMaterial({
            color: "#38bdf8",
            emissive: "#0284c7",
            emissiveIntensity: 0.9,
            roughness: 0.2,
          }),
        );
        reactToken.add(reactCore);

        const reactRingMat = new THREE.MeshStandardMaterial({
          color: "#7dd3fc",
          emissive: "#0284c7",
          emissiveIntensity: 0.6,
          roughness: 0.3,
        });

        const reactRings = [];
        for (let i = 0; i < 3; i++) {
          const rRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.32, 0.022, 8, 32),
            reactRingMat,
          );
          rRing.rotation.x = Math.PI / 2;
          rRing.rotation.y = (i * Math.PI) / 3;
          reactToken.add(rRing);
          reactRings.push(rRing);
        }
        orbitsGroup.add(reactToken);

        // Tech Token 2: Ruby Gem (Rails)
        const rubyMat = new THREE.MeshStandardMaterial({
          color: "#e11d48",
          emissive: "#881337",
          emissiveIntensity: 0.7,
          metalness: 0.5,
          roughness: 0.18,
        });
        const rubyToken = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.28, 0),
          rubyMat,
        );
        orbitsGroup.add(rubyToken);

        // Tech Token 3: Database Node (Postgres / Data)
        const dbToken = new THREE.Group();
        const dbDiscMat = new THREE.MeshStandardMaterial({
          color: "#3d3049",
          metalness: 0.7,
          roughness: 0.3,
        });
        const dbGlowMat = new THREE.MeshStandardMaterial({
          color: "#4ade80",
          emissive: "#22c55e",
          emissiveIntensity: 1.1,
          roughness: 0.2,
        });
        for (let i = 0; i < 3; i++) {
          const disc = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.09, 24),
            dbDiscMat,
          );
          disc.position.y = (i - 1) * 0.14;
          dbToken.add(disc);

          const glowRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.255, 0.015, 6, 24),
            dbGlowMat,
          );
          glowRing.rotation.x = Math.PI / 2;
          glowRing.position.y = (i - 1) * 0.14;
          dbToken.add(glowRing);
        }
        orbitsGroup.add(dbToken);

        // Tech Token 4: Fast API / Lightning Prism
        const prismMat = new THREE.MeshStandardMaterial({
          color: "#e4fb92",
          emissive: "#a3e635",
          emissiveIntensity: 0.9,
          metalness: 0.8,
          roughness: 0.2,
        });
        const prismToken = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.44, 4),
          prismMat,
        );
        prismToken.rotation.x = Math.PI;
        orbitsGroup.add(prismToken);

        // Tech Token 5: Code Bracket Tag </>
        const tagGroup = new THREE.Group();
        const tagBox = new THREE.Mesh(
          new RoundedBoxGeometry(0.52, 0.32, 0.08, 2, 0.03),
          new THREE.MeshStandardMaterial({
            color: "#281e32",
            metalness: 0.6,
            roughness: 0.3,
          }),
        );
        tagGroup.add(tagBox);

        const tagCanvas = document.createElement("canvas");
        tagCanvas.width = 128;
        tagCanvas.height = 80;
        const tctx = tagCanvas.getContext("2d");
        tctx.fillStyle = "#281e32";
        tctx.fillRect(0, 0, 128, 80);
        tctx.font = "bold 44px 'Courier New', monospace";
        tctx.textAlign = "center";
        tctx.textBaseline = "middle";
        tctx.fillStyle = "#e4fb92";
        tctx.fillText("</>", 64, 42);

        const tagTexture = new THREE.CanvasTexture(tagCanvas);
        tagTexture.colorSpace = THREE.SRGBColorSpace;
        const tagScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.48, 0.28),
          new THREE.MeshBasicMaterial({ map: tagTexture }),
        );
        tagScreen.position.z = 0.045;
        tagGroup.add(tagScreen);
        orbitsGroup.add(tagGroup);

        // Particle cloud (stars / dust)
        const particleCount = 75;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPal = [
          new THREE.Color("#e4fb92"),
          new THREE.Color("#c084fc"),
          new THREE.Color("#7dd3fc"),
          new THREE.Color("#fff7ee"),
        ];

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 8;
          positions[i * 3 + 1] = Math.random() * 4 - 0.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

          const c = colorPal[i % colorPal.length];
          colors[i * 3] = c.r;
          colors[i * 3 + 1] = c.g;
          colors[i * 3 + 2] = c.b;
        }

        particleGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        particleGeo.setAttribute(
          "color",
          new THREE.BufferAttribute(colors, 3),
        );

        const particleMat = new THREE.PointsMaterial({
          size: 0.045,
          vertexColors: true,
          transparent: true,
          opacity: 0.65,
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ----------------- ANIMATION STATE & LOOP -----------------
        let elapsed = 0;
        let previous = 0;
        let lastRendered = 0;
        let isPaused = paused;
        let inView = true;
        let pulseScale = 1;
        let targetScroll = 0;
        let currentScroll = 0;

        const pointer = new THREE.Vector2();
        const currentPointer = new THREE.Vector2();

        let baseCameraZ = 8.4;
        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          baseCameraZ = width / height < 0.75 ? 9.8 : 8.4;
          camera.position.z = baseCameraZ;
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

        const onPointerDown = () => {
          pulseScale = 1.25;
        };

        const onScroll = () => {
          targetScroll = Math.max(0, Math.min(2.0, (window.scrollY || window.pageYOffset || 0) / 450));
        };

        container.addEventListener("pointermove", pointerMove);
        container.addEventListener("pointerleave", pointerLeave);
        container.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        // Ready phase notification
        phaseCallback.current?.("ready");

        const render = (time) => {
          if (disposed) return;
          if (!inView || document.hidden) {
            previous = time;
            return;
          }

          if (time - lastRendered < 20) return;
          const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
          previous = time;
          lastRendered = time;

          if (!isPaused) {
            elapsed += delta;
          }

          const t = elapsed;

          // Smooth scroll lerping for silky parallax
          currentScroll += (targetScroll - currentScroll) * 0.1;
          const s = currentScroll;

          // Pulse decay
          pulseScale += (1 - pulseScale) * 0.1;

          // Floating laptop harmonic motion + scroll tilt
          laptopGroup.position.y = Math.sin(t * 1.5) * 0.06;
          laptopGroup.rotation.z = Math.sin(t * 1.1) * 0.025;
          laptopGroup.rotation.x = Math.sin(t * 0.9) * 0.02 + s * 0.45;
          laptopGroup.rotation.y = s * 0.38;

          // Smooth pointer parallax combined with 3D scroll elevation
          currentPointer.lerp(pointer, 0.07);
          mainPivot.rotation.y = 0.25 + currentPointer.x * 0.55 + s * 0.35;
          mainPivot.rotation.x = 0.12 - currentPointer.y * 0.35 + s * 0.25;
          mainPivot.position.y = 1.3 + s * 1.5;

          // Camera parallax shift
          camera.position.y = 2.5 + s * 1.0;
          camera.position.z = baseCameraZ + s * 2.2;
          camera.lookAt(0, 1.25 + s * 0.6, 0);

          // Update screen canvas texture
          drawScreen(time);
          screenTexture.needsUpdate = true;

          // Orbit tokens expand outward on scroll (3D dispersion effect!)
          const scrollExpand = 1 + s * 0.85;
          const r1 = 2.3 * pulseScale * scrollExpand;
          const a1 = t * 0.65;
          reactToken.position.set(
            Math.cos(a1) * r1,
            0.5 + Math.sin(a1 * 2) * 0.25 + s * 0.5,
            Math.sin(a1) * r1 * 0.7,
          );
          reactRings.forEach((r, idx) => {
            r.rotation.z = t * (1.2 + idx * 0.4);
          });

          const r2 = 2.1 * pulseScale * scrollExpand;
          const a2 = t * 0.75 + Math.PI * 0.45;
          rubyToken.position.set(
            Math.cos(a2) * r2,
            -0.2 + Math.cos(a2 * 2) * 0.2 - s * 0.4,
            Math.sin(a2) * r2 * 0.65,
          );
          rubyToken.rotation.y = t * 1.8;
          rubyToken.rotation.x = t * 1.1;

          const r3 = 2.6 * pulseScale * scrollExpand;
          const a3 = t * 0.55 + Math.PI;
          dbToken.position.set(
            Math.cos(a3) * r3,
            0.15 + Math.sin(a3 * 1.5) * 0.22 + s * 0.6,
            Math.sin(a3) * r3 * 0.6,
          );
          dbToken.rotation.y = t * 0.8;

          const r4 = 2.4 * pulseScale * scrollExpand;
          const a4 = t * 0.8 + Math.PI * 1.4;
          prismToken.position.set(
            Math.cos(a4) * r4,
            0.8 + Math.cos(a4 * 2) * 0.2 + s * 0.8,
            Math.sin(a4) * r4 * 0.6,
          );
          prismToken.rotation.y = t * 2.2;
          prismToken.rotation.z = Math.sin(t * 2) * 0.3;

          const r5 = 1.95 * pulseScale * scrollExpand;
          const a5 = t * 0.9 + Math.PI * 1.85;
          tagGroup.position.set(
            Math.cos(a5) * r5,
            0.7 + Math.sin(a5 * 1.7) * 0.18 + s * 0.4,
            Math.sin(a5) * r5 * 0.6,
          );
          tagGroup.rotation.y = a5 + Math.PI / 2;

          // Parallax particle drift: particles streak vertically with scroll!
          particles.position.y = s * 4.2;
          particles.rotation.y = t * 0.05;

          // Shadow fades and scales gracefully as scene elevates
          floorShadow.material.opacity = Math.max(0, 1 - s * 1.3);
          floorShadow.scale.setScalar(1 + s * 0.5);

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

        controls.current = {
          pulse() {
            pulseScale = 1.35;
            pointer.set(0, 0);
          },
          pause(val) {
            isPaused = val;
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
          container.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("scroll", onScroll);

          const geometries = new Set();
          const materials = new Set();
          const textures = new Set();

          scene.traverse((object) => {
            if (object.geometry) geometries.add(object.geometry);
            if (object.material) {
              for (const mat of Array.isArray(object.material)
                ? object.material
                : [object.material]) {
                materials.add(mat);
                if (mat.map) textures.add(mat.map);
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
          phaseCallback.current?.("ready");
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
      aria-label="Interactive 3D developer workstation with floating laptop, live code screen, and orbiting Rails, React, and Database tech tokens."
    >
      {failed && (
        <div className="bb-character-fallback">
          <span className="bb-fallback-mark">b.</span>
          <strong>Built by Bala</strong>
          <span>Websites & Software That Actually Work</span>
          <small>Independent Full-Stack Developer</small>
        </div>
      )}
    </div>
  );
}
