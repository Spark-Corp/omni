"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Globe, MapPin, ArrowRight, Sparkles, Shield, Smartphone,
  ChevronRight, Search, MessageCircle, Store, ShoppingBag, Navigation, Mic,
} from "lucide-react";
import * as THREE from "three";
import useAuth from "@/utils/useAuth";

// --- Splash screen shown while Three.js initializes ---
function Splash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#08080f]"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
        <Globe className="text-white" size={20} />
      </div>
      <span className="font-space-grotesk text-lg font-semibold text-white/80">Omni</span>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// --- 3D Globe with interaction ---
function Globe3D({ phase = 0, onReady }) {
  const containerRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [webglOk, setWebglOk] = useState(true);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (!W || !H) return;
    let renderer, animId, gl;
    try {
      const c = document.createElement('canvas');
      gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) { setWebglOk(false); onReadyRef.current?.(); return; }
      const hp = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
      if (!hp || !hp.precision) { setWebglOk(false); onReadyRef.current?.(); return; }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch (e) { setWebglOk(false); onReadyRef.current?.(); return; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 3.2;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { setWebglOk(false); onReadyRef.current?.(); return; }
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x08080f, 1);
    renderer.domElement.style.backgroundColor = '#08080f';
    renderer.domElement.style.outline = 'none';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404060, 0.7);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048; texCanvas.height = 1024;
    const ctx = texCanvas.getContext("2d");
    ctx.fillStyle = "#08080f"; ctx.fillRect(0, 0, 2048, 1024);
    const continents = [
      { x: 0.5, y: 0.55, rx: 0.12, ry: 0.18, c: "#0d2a1a" },
      { x: 0.5, y: 0.55, rx: 0.10, ry: 0.16, c: "#103a22" },
      { x: 0.48, y: 0.32, rx: 0.06, ry: 0.05, c: "#0f2a18" },
      { x: 0.48, y: 0.32, rx: 0.05, ry: 0.04, c: "#143a20" },
      { x: 0.72, y: 0.38, rx: 0.18, ry: 0.12, c: "#0a2818" },
      { x: 0.72, y: 0.38, rx: 0.16, ry: 0.10, c: "#103a22" },
      { x: 0.20, y: 0.30, rx: 0.10, ry: 0.08, c: "#0d2a1a" },
      { x: 0.20, y: 0.30, rx: 0.08, ry: 0.06, c: "#123822" },
      { x: 0.28, y: 0.60, rx: 0.04, ry: 0.10, c: "#0a2818" },
      { x: 0.28, y: 0.60, rx: 0.03, ry: 0.08, c: "#103a22" },
      { x: 0.88, y: 0.72, rx: 0.03, ry: 0.03, c: "#0f2a1a" },
    ];
    for (const c of continents) {
      ctx.beginPath(); ctx.ellipse(c.x * 2048, c.y * 1024, c.rx * 2048, c.ry * 1024, 0, 0, Math.PI * 2);
      ctx.fillStyle = c.c; ctx.fill();
    }
    const cities = [
      { lon: 1.22, lat: 6.13 }, { lon: -3.99, lat: 5.35 },
      { lon: 3.38, lat: 6.45 }, { lon: 11.50, lat: 3.87 },
      { lon: 17.46, lat: -12.34 }, { lon: 13.20, lat: 9.18 },
      { lon: -1.69, lat: 9.40 }, { lon: 1.48, lat: 6.63 },
      { lon: 2.34, lat: 6.66 }, { lon: -0.23, lat: 14.45 },
      { lon: -15.98, lat: 18.06 }, { lon: -17.45, lat: 14.72 },
    ];
    for (const c of cities) {
      const x = ((c.lon + 180) / 360) * 2048;
      const y = ((90 - c.lat) / 180) * 1024;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, "rgba(16, 185, 129, 0.95)");
      g.addColorStop(0.5, "rgba(16, 185, 129, 0.3)");
      g.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = g; ctx.fillRect(x - 14, y - 14, 28, 28);
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#34d399"; ctx.fill();
    }
    const texture = new THREE.CanvasTexture(texCanvas);
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 80, 80),
      new THREE.MeshPhongMaterial({ map: texture, emissive: new THREE.Color(0x050510), emissiveIntensity: 0.25, roughness: 0.7 })
    );
    scene.add(earth);
    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 40, 24),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0x10b981, transparent: true, opacity: 0.06 })
    );
    scene.add(grid);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide,
      uniforms: { color: { value: new THREE.Color(0x10b981) }, intensity: { value: 0.35 }, time: { value: 0 } },
      vertexShader: `varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vNormal;uniform vec3 color;uniform float intensity;uniform float time;void main(){float i=pow(0.65-dot(vNormal,vec3(0,0,1.0)),3.5);float p=1.0+0.1*sin(time);gl_FragColor=vec4(color,i*intensity*p);}`,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), atmoMat);
    scene.add(atmosphere);

    // Interactive rotation group
    const rotGroup = new THREE.Group();
    rotGroup.add(earth); rotGroup.add(grid); rotGroup.add(atmosphere);
    scene.add(rotGroup);

    // City dots — separate group that appears after phase 2
    const cityGroup = new THREE.Group();
    const city3D = cities.map(c => {
      const phi = (90 - c.lat) * Math.PI / 180, theta = (c.lon + 180) * Math.PI / 180;
      return { x: -Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta) };
    });
    const dotMeshes = [];
    city3D.forEach((c, i) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
      dot.position.set(c.x * 1.01, c.y * 1.01, c.z * 1.01);
      cityGroup.add(dot); dotMeshes.push(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.045, 16), new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      ring.position.set(c.x * 1.06, c.y * 1.06, c.z * 1.06); ring.lookAt(0, 0, 0);
      ring.userData = { speed: 0.008 + Math.random() * 0.008, phase: Math.random() * Math.PI * 2 };
      cityGroup.add(ring);
      const gc = document.createElement("canvas"); gc.width = 48; gc.height = 48;
      const gctx = gc.getContext("2d"); const grad = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, "rgba(52,211,153,0.8)"); grad.addColorStop(1, "rgba(52,211,153,0)");
      gctx.fillStyle = grad; gctx.fillRect(0, 0, 48, 48);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.12, 0.12, 1); glow.position.set(c.x * 1.02, c.y * 1.02, c.z * 1.02);
      cityGroup.add(glow);
    });
    const target = city3D[0];
    const hlDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    hlDot.position.set(target.x * 1.01, target.y * 1.01, target.z * 1.01); hlDot.visible = false;
    cityGroup.add(hlDot);
    const hlRing = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.1, 24), new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    hlRing.position.set(target.x * 1.1, target.y * 1.1, target.z * 1.1); hlRing.lookAt(0, 0, 0); hlRing.visible = false;
    cityGroup.add(hlRing);
    rotGroup.add(cityGroup);

    // Mock vendor pins — appear when phase >= 2, matching 6 continent-spanning cards
    const vendorsGroup = new THREE.Group();
    const mockVendorLocs = [
      { lon: 1.2228, lat: 6.1319 },   // Lomé, Afrique — primary (green)
      { lon: -46.6333, lat: -23.5505 }, // São Paulo, Amériques
      { lon: -74.0060, lat: 40.7128 },  // New York, Amériques
      { lon: 2.3522, lat: 48.8566 },    // Paris, Europe
      { lon: 139.6917, lat: 35.6895 },  // Tokyo, Asie
      { lon: 151.2093, lat: -33.8688 }, // Sydney, Océanie
    ];
    const vendorColors = [0x10b981, 0xf59e0b, 0xf59e0b, 0xf59e0b, 0xf59e0b, 0xf59e0b];
    const vendorSizes = [0.032, 0.022, 0.022, 0.022, 0.022, 0.022];
    const vendorDots = [];
    mockVendorLocs.forEach((v, i) => {
      const phi = (90 - v.lat) * Math.PI / 180, theta = (v.lon + 180) * Math.PI / 180;
      const x = -Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(vendorSizes[i], 10, 10), new THREE.MeshBasicMaterial({ color: vendorColors[i] }));
      dot.position.set(x * 1.02, y * 1.02, z * 1.02);
      dot.userData = { idx: i, baseScale: 1 };
      vendorsGroup.add(dot); vendorDots.push(dot);
      const vRing = new THREE.Mesh(new THREE.RingGeometry(0.025 + i * 0.005, 0.05 + i * 0.01, 16), new THREE.MeshBasicMaterial({ color: vendorColors[i], transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      vRing.position.set(x * 1.08, y * 1.08, z * 1.08); vRing.lookAt(0, 0, 0);
      vRing.userData = { speed: 0.01 + i * 0.002, phase: Math.random() * Math.PI * 2 };
      vendorsGroup.add(vRing);
      const gc2 = document.createElement("canvas"); gc2.width = 48; gc2.height = 48;
      const c2 = gc2.getContext("2d");
      const g2 = c2.createRadialGradient(24, 24, 0, 24, 24, 24);
      const col = i === 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.8)';
      g2.addColorStop(0, col); g2.addColorStop(1, 'rgba(0,0,0,0)');
      c2.fillStyle = g2; c2.fillRect(0, 0, 48, 48);
      const vGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc2), transparent: true, blending: THREE.AdditiveBlending }));
      vGlow.scale.set(i === 0 ? 0.2 : 0.12, i === 0 ? 0.2 : 0.12, 1);
      vGlow.position.set(x * 1.02, y * 1.02, z * 1.02);
      vendorsGroup.add(vGlow);
    });
    vendorsGroup.visible = false;
    rotGroup.add(vendorsGroup);

    // Mouse interaction
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let autoRotate = true;
    let interactTimeout = null;

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX; prevY = e.clientY;
      autoRotate = false;
      renderer.domElement.style.cursor = 'grabbing';
      clearTimeout(interactTimeout);
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      rotGroup.rotation.y += dx * 0.01;
      rotGroup.rotation.x += dy * 0.005;
      prevX = e.clientX; prevY = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
      interactTimeout = setTimeout(() => { autoRotate = true; }, 3000);
    });
    // Touch support
    let touchId = null;
    renderer.domElement.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      touchId = t.identifier; prevX = t.clientX; prevY = t.clientY;
      autoRotate = false; clearTimeout(interactTimeout);
    }, { passive: true });
    renderer.domElement.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== touchId) continue;
        const dx = t.clientX - prevX; const dy = t.clientY - prevY;
        rotGroup.rotation.y += dx * 0.01;
        rotGroup.rotation.x += dy * 0.005;
        prevX = t.clientX; prevY = t.clientY;
      }
    }, { passive: true });
    renderer.domElement.addEventListener('touchend', () => {
      touchId = null; autoRotate = false;
      interactTimeout = setTimeout(() => { autoRotate = true; }, 3000);
    }, { passive: true });

    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const p = phaseRef.current;
      const dt = clock.getElapsedTime();

      // Auto-rotation
      if (autoRotate) rotGroup.rotation.y += 0.002 + Math.min(p, 2) * 0.0008;

      // Smooth camera zoom — no artificial breathe oscillation
      const targetZ = 3.2 - Math.min(p, 2) * 0.5;
      camera.position.z += (targetZ - camera.position.z) * 0.04;

      // Atmosphere — phase-driven only, no time pulse
      atmoMat.uniforms.time.value = dt;
      atmoMat.uniforms.intensity.value = 0.3 + Math.min(p, 3) * 0.12;

      // City dots: hidden in phase 0, fade in at phase 1-2, full at phase 3
      const cityTarget = Math.min(1, Math.max(0, (Math.min(p, 3) - 0.5) / 1.5));
      // Mock vendor pins: appear at phase 2
      vendorsGroup.visible = p >= 2;
      cityGroup.children.forEach(child => {
        if (child.type === "Mesh" && child.geometry?.type === "RingGeometry" && child !== hlRing) {
          const t = (child.userData?.phase || 0);
          child.userData.phase = t + (child.userData?.speed || 0.008);
          const s = 1 + Math.sin(t) * 0.4;
          child.scale.set(s, s, 1);
          child.material.opacity = cityTarget * (0.3 + Math.sin(t) * 0.25);
        }
        if (child.type === "Points" || child.type === "Sprite" || (child.type === "Mesh" && child.geometry?.type === "SphereGeometry")) {
          child.visible = cityTarget > 0.05;
        }
      });
      dotMeshes.forEach((d, i) => {
        const pulse = 1 + Math.sin(dt * 2 + i * 0.5) * 0.2;
        d.scale.set(pulse * cityTarget, pulse * cityTarget, pulse * cityTarget);
      });
      hlDot.visible = p >= 3; hlRing.visible = p >= 3;
      if (hlRing.visible) {
        const s = 1 + Math.sin(dt * 2) * 0.6; hlRing.scale.set(s, s, 1);
        hlRing.material.opacity = 0.3 + Math.sin(dt * 3) * 0.4;
      }
      // Vendor pins pulse
      if (vendorsGroup.visible) {
        vendorDots.forEach((d, i) => {
          const s = 1.2 + Math.sin(dt * 3 + i * 0.8) * 0.3;
          d.scale.set(s, s, s);
        });
        vendorsGroup.children.forEach(child => {
          if (child.type === "Mesh" && child.geometry?.type === "RingGeometry") {
            const t = (child.userData?.phase || 0);
            child.userData.phase = t + (child.userData?.speed || 0.01);
            const s = 1 + Math.sin(t) * 0.6;
            child.scale.set(s, s, 1);
          }
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => { if (!container.clientWidth || !container.clientHeight) return; camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(container);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); ro.disconnect(); container.removeChild(renderer.domElement); renderer.dispose(); };
    onReadyRef.current?.();
  }, []);

  if (!webglOk) {
    return (
      <div className="w-full h-full min-h-[300px] sm:min-h-[400px] flex items-center justify-center bg-[#08080f]">
        <Globe size={48} className="text-emerald-400/30" />
      </div>
    );
  }
  return <div ref={containerRef} className="w-full h-full min-h-[300px] sm:min-h-[400px] bg-[#08080f]" style={{ outline: 'none' }} />;
}

// Full-page CSS stars — no visible boundary, feels infinite
const starPositions = Array.from({ length: 300 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: 0.5 + Math.random() * 1.5,
  o: 0.1 + Math.random() * 0.3,
}));

// --- Scroll-driven demo: premium 300vh + sticky pin pattern ---
function ScrollDemo({ onPhaseChange, onReady }) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Track scroll progress through the section (continuous 0→1)
  const [initVH] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 0);
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el || !initVH) return;
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollable = el.offsetHeight - initVH;
      if (scrollable <= 0) return;
      const scrolled = window.scrollY - sectionTop;
      setProgress(Math.max(0, Math.min(1, scrolled / scrollable)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [initVH]);

  // Derive phase + phase progress from continuous scroll
  const totalPhases = 4;
  const raw = progress * totalPhases;                     // 0 → 4
  const phase = Math.min(3, Math.floor(raw));
  const phaseProgress = Math.min(1, raw - phase);         // 0→1 within each phase

  // Continuous values used by Globe3D (0→3)
  const globePhase = Math.min(3, raw);

  // Typing
  const searchText = "tomates";
  const typedLen = phase >= 1 ? Math.min(searchText.length, Math.floor(phaseProgress * searchText.length)) : 0;
  const typed = searchText.slice(0, typedLen);

  const searchOpacity = phase >= 1 ? Math.min(1, phaseProgress * 2) : 0;
  const markersProgress = phase >= 2 ? Math.min(1, phaseProgress * 1.2) : 0;
  const resultProgress = phase >= 3 ? Math.min(1, phaseProgress * 1.4) : 0;

  // DIAGNOSTIC: Log positions
  // Notify parent (nav dots)
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: '300vh' }}>
      {/* Sticky container — pinned while its parent scrolls */}
      <div className="sticky top-0 h-dvh">
        <div className="w-full h-full flex flex-col pt-14 relative">
        {/* Background glow + stars */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {starPositions.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`, top: `${s.y}%`,
                width: `${s.s}px`, height: `${s.s}px`, opacity: s.o,
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-emerald-500/[0.04] rounded-full blur-[200px]" />
          <div className="absolute top-1/3 left-1/4 w-[80%] h-[60%] bg-emerald-600/[0.02] rounded-full blur-[150px]" />
        </div>

          <div className="relative flex-1 w-full overflow-visible"
            style={{
              transform: `scale(${1 - phase * 0.06}) translateY(${-phase * 3}%)`,
            }}
          >
            <div className="relative w-full h-full">
              <Globe3D phase={globePhase} onReady={onReady} />
            </div>

          {/* Content — inside flex-1, moves with globe */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="lg:pl-8 xl:pl-12 w-full text-center lg:text-left pt-4 sm:pt-8 xl:pt-16">
                {/* Badge + heading — collapses at phase 2 */}
                <div className="transition-all duration-700 overflow-hidden"
                  style={{
                    maxHeight: phase < 2 ? '250px' : '0px',
                    opacity: phase < 2 ? 1 : Math.max(0, 1 - (phase - 2) * 1.5),
                    marginBottom: phase < 2 ? '20px' : '0px',
                  }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
                    <Sparkles size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-[10px] sm:text-xs xl:text-sm text-white/70">Les facilités de ton quartier, sur une carte</span>
                  </div>
                  <h2 className="font-space-grotesk text-2xl sm:text-4xl xl:text-6xl font-bold tracking-tight leading-snug sm:leading-tight">
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Omni</span>
                    <span className="text-white/80 block mt-1">Trouve tout ce qui existe autour de toi.</span>
                  </h2>
                  <p className="font-dm-sans text-white/50 text-xs sm:text-sm xl:text-base mt-2 sm:mt-3 max-w-md mx-auto lg:mx-0">
                    Marchés, artisans, services. Partout où tu vas, en un clic.
                  </p>
                </div>

                <div className="max-w-md mx-auto lg:mx-0">
                  {/* Phase 1: Search bar — collapses when inactive */}
                  <div className="transition-all duration-500 overflow-hidden"
                    style={{ maxHeight: searchOpacity > 0 ? '80px' : '0px' }}
                  >
                    <div className="transition-all duration-500 pointer-events-auto pt-4"
                      style={{
                        opacity: searchOpacity,
                        transform: `translateY(${(1 - searchOpacity) * 20}px)`,
                      }}
                    >
                      <div className="flex items-center bg-black/10 backdrop-blur-lg rounded-2xl border border-white/[0.04] px-4 py-3">
                        <Search size={16} className="text-emerald-400 mr-3 shrink-0" />
                        <span className="flex-1 text-white/80 text-sm font-light tracking-wide font-dm-sans">
                          {typed}
                          <span className={`animate-pulse text-emerald-400 ${typedLen >= searchText.length ? 'opacity-0' : ''}`}>|</span>
                        </span>
                        <Mic size={14} className="text-white/30 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Markers — collapses when inactive */}
                  <div className="transition-all duration-500 overflow-hidden"
                    style={{ maxHeight: markersProgress > 0 ? '400px' : '0px' }}
                  >
                    <div className="space-y-2 transition-all duration-500 pointer-events-auto pt-4"
                      style={{
                        opacity: markersProgress,
                        transform: `translateY(${(1 - markersProgress) * 20}px)`,
                      }}
                    >
                      {[
                        { name: "Marché de Bè · Lomé", product: "Tomates · 300 FCFA/kg", dist: "120m", continent: "Quartier Bè", delay: 0 },
                        { name: "Boulangerie Adidogomé", product: "Pain au chocolat · 250 FCFA", dist: "450m", continent: "Quartier Adidogomé", delay: 0.15 },
                        { name: "Épicerie Doumasséssé", product: "Huile d'olive · 2 500 FCFA", dist: "800m", continent: "Quartier Doumasséssé", delay: 0.3 },
                        { name: "Fruits & Légumes Hodzo", product: "Ananas · 1 000 FCFA", dist: "1,2 km", continent: "Quartier Hodzo", delay: 0.45 },
                        { name: "Poissonnerie Kodjoviakopé", product: "Bar frais · 2 000 FCFA/pièce", dist: "1,8 km", continent: "Quartier Kodjoviakopé", delay: 0.6 },
                        { name: "Marché des Cocos · Lomé", product: "Noix de coco · 200 FCFA", dist: "2,5 km", continent: "Quartier Cocos", delay: 0.75 },
                      ].map((m, i) => {
                        const cardT = Math.max(0, Math.min(1, (markersProgress - m.delay) / 0.2));
                        return (
                        <div key={i}
                          className="flex items-center gap-2"
                          style={{
                            opacity: cardT,
                            transform: `translateY(${(1 - cardT) * 20}px)`,
                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-emerald-400' : 'bg-amber-400/70'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/80 font-dm-sans">{m.name}</p>
                            <p className="text-xs text-white/40 font-dm-sans">{m.product}</p>
                          </div>
                          <span className="text-xs text-white/30 shrink-0">{m.dist}</span>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Phase 3: Result — collapses when inactive */}
                  <div className="transition-all duration-500 overflow-hidden"
                    style={{ maxHeight: resultProgress > 0 ? '180px' : '0px' }}
                  >
                    <div className="transition-all duration-500 pointer-events-auto pt-4"
                      style={{
                        opacity: resultProgress,
                        transform: `translateY(${(1 - resultProgress) * 20}px)`,
                      }}
                    >
                      <p className="font-space-grotesk text-base font-medium text-white/80 mb-1">
                        <span className="text-emerald-400 font-bold">6 vendeurs</span> trouvés
                      </p>
                      <p className="font-dm-sans text-sm text-white/40 mb-2">Tomates, fruits, pains — dans ton quartier.</p>
                      <a href="/map"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors font-dm-sans"
                      >
                        Voir sur la carte
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay — inside flex-1, fades globe into dark bg */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#08080f] via-[#08080f]/80 to-transparent pointer-events-none" />

          {/* Mobile overlay */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
            <div className="text-center transition-all duration-500"
              style={{ opacity: 1 - Math.min(1, phase / 1.5) }}
            >
              <p className="text-white/90 text-lg font-semibold font-space-grotesk">Trouve, vends, livre. Autour de toi.</p>
              <p className="font-dm-sans text-white/40 text-xs mt-2">Scrolle pour découvrir</p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        {phase < 3 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <span className="font-dm-sans text-[10px] text-white/[0.15] animate-bounce">↓ Scrolle</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [demoPhase, setDemoPhase] = useState(0);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{!splashDone && <Splash />}</AnimatePresence>
      <div className={`min-h-screen bg-[#08080f] text-white ${splashDone ? '' : 'invisible'}`}>
      {/* NAV — sticky: starts as site head, becomes overlay on scroll */}
      <nav className="sticky top-0 z-50 h-14">
        {/* Background layer — fades out as scroll progresses */}
        <div className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            opacity: 1 - Math.min(1, demoPhase / 3),
            backgroundColor: '#08080f',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[1px] transition-all duration-700 ease-out"
          style={{
            opacity: 1 - Math.min(1, demoPhase / 2),
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        />
        {/* Content layer — fades slightly into overlay */}
        <div className="relative h-full transition-all duration-700 ease-out"
          style={{ opacity: 1 - Math.min(1, demoPhase / 3) * 0.35 }}
        >
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="text-white" size={14} />
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight font-space-grotesk">Omni</span>
          </a>
          <div className="hidden sm:flex items-center gap-6 text-xs sm:text-sm text-white/50">
            <a href="/map" className="hover:text-white/80 transition-colors">Explorer</a>
            <a href="/vendor/onboarding" className="hover:text-white/80 transition-colors">Je vends</a>
            <a href="/delivery/onboarding" className="hover:text-white/80 transition-colors">Je livre</a>
          </div>
          {/* Phase dots — in nav, not floating at bottom */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {[0, 1, 2, 3].map(p => (
              <div key={p} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: demoPhase >= p ? '#34d399' : 'rgba(255,255,255,0.12)',
                  transform: demoPhase >= p ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <a href="/map" className="px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-xs sm:text-sm transition-all">Explorer</a>
            ) : (
              <>
                <a href="/auth" className="px-2.5 sm:px-3 py-1.5 rounded-lg text-white/60 hover:text-white text-xs sm:text-sm transition-all">Connexion</a>
                <a href="/auth" className="px-3 sm:px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm transition-all border border-white/10">S'inscrire</a>
              </>
            )}
          </div>
          </div>
        </div>
      </nav>

      {/* SCROLL DEMO — everything happens here */}
      <ScrollDemo onPhaseChange={setDemoPhase} onReady={() => setSplashDone(true)} />

      {/* PROBLEM */}
      <section className="py-28 md:py-32 px-6 border-y border-white/[0.03]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400/80 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium font-space-grotesk">Le vrai problème</span>
          <h2 className="font-space-grotesk text-3xl md:text-5xl font-bold tracking-tight mt-6 mb-8 leading-tight">
            Ton quartier a des facilités que tu ne vois pas.
          </h2>
          <p className="font-dm-sans text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Marché de Bè, boulangerie du quartier, boutique au coin de la rue… Dans chaque rue, des gens vendent.
            Sans vitrine, sans pub, sans site.
            <span className="text-emerald-400/80 block mt-2 font-medium">Omni les rend visibles. En 3 secondes.</span>
          </p>
        </div>
      </section>

      {/* TWO SIDES */}
      <section className="py-28 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400/80 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium font-space-grotesk">Pour tout le monde</span>
            <h2 className="font-space-grotesk text-3xl md:text-5xl font-bold tracking-tight mt-6">Un outil. Trois façons de t'en servir.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/[0.04] to-transparent border border-emerald-500/10">
              <ShoppingBag size={24} className="text-emerald-400 mb-4" />
              <h3 className="font-space-grotesk text-xl md:text-2xl font-bold mb-4">Je cherche quelque chose</h3>
              <ul className="font-dm-sans space-y-3 text-white/50 text-sm leading-relaxed">
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5 font-medium">→</span> Tape ce que tu veux, on te dit qui l'a autour de toi</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5 font-medium">→</span> Prix, distance, dispo en un coup d'œil</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5 font-medium">→</span> Contacte le vendeur en direct</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5 font-medium">→</span> Livraison crowd en 1 clic</li>
              </ul>
            </div>
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-500/[0.04] to-transparent border border-blue-500/10">
              <Store size={24} className="text-blue-400 mb-4" />
              <h3 className="font-space-grotesk text-xl md:text-2xl font-bold mb-4">Je vends quelque chose</h3>
              <ul className="font-dm-sans space-y-3 text-white/50 text-sm leading-relaxed">
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5 font-medium">→</span> Sois visible pour ceux qui cherchent près de chez toi</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5 font-medium">→</span> Zéro pub, zéro site, zéro effort</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5 font-medium">→</span> Reçois les demandes des clients en direct</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5 font-medium">→</span> Réponds OUI ou NON, c'est tout</li>
              </ul>
            </div>
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-amber-500/10">
              <Navigation size={24} className="text-amber-400 mb-4" />
              <h3 className="font-space-grotesk text-xl md:text-2xl font-bold mb-4">Je livre</h3>
              <ul className="font-dm-sans space-y-3 text-white/50 text-sm leading-relaxed">
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 font-medium">→</span> Gagne de l'argent sur tes trajets quotidiens</li>
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 font-medium">→</span> Mode rayon ou trajet A→B, choisis ton rayon</li>
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 font-medium">→</span> Reçois les demandes près de chez toi</li>
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 font-medium">→</span> Multiplie tes gains avec le premium</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-white/5 to-blue-500/10 border border-white/10 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-space-grotesk text-3xl md:text-5xl font-bold tracking-tight mb-6">Trouve, vends ou livre. Là, autour de toi.</h2>
              <p className="font-dm-sans text-white/50 text-base mb-10 max-w-lg mx-auto">Des facilités, des produits, des trajets. Tout est près de chez toi.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/map"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg transition-all">
                  Trouver un produit
                  <ChevronRight size={20} />
                </a>
                <a href="/vendor/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all">
                  Devenir vendeur
                </a>
                <a href="/delivery/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-500/[0.08] hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-semibold text-lg transition-all">
                  Devenir livreur
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 md:py-12 px-6 border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="text-white" size={16} />
            </div>
            <span className="font-semibold font-space-grotesk">Omni</span>
          </div>
          <p className="font-dm-sans text-xs text-white/30">© 2026 Omni. Trouve, vends, livre — autour de toi.</p>
          <div className="flex items-center gap-6 text-sm text-white/35">
            <a href="#" className="hover:text-white/60 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white/60 transition-colors">Conditions</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 rounded-3xl bg-[#0f0f1a] border border-white/[0.06] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-space-grotesk text-2xl font-bold mb-3">Connexion requise</h3>
              <p className="font-dm-sans text-white/50 mb-8">Crée un compte pour explorer la carte.</p>
              <div className="flex flex-col gap-3">
                <a href="/auth" className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all">Se connecter</a>
                <a href="/auth" className="w-full py-4 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">Créer un compte</a>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors">Annuler</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
