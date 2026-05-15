"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Globe, MapPin, ArrowRight, Sparkles, Shield, Smartphone,
  ChevronRight, Search, MessageCircle, Store, ShoppingBag, Navigation, Mic,
} from "lucide-react";
import * as THREE from "three";
import useAuth from "@/utils/useAuth";

// --- 3D Globe ---
function Globe3D({ phase = 0 }) {
  const containerRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 3.2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404060, 0.7);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048; texCanvas.height = 1024;
    const ctx = texCanvas.getContext("2d");
    ctx.fillStyle = "#0a1628"; ctx.fillRect(0, 0, 2048, 1024);
    const continents = [
      { x: 0.5, y: 0.55, rx: 0.12, ry: 0.18, c: "#1a3a2a" },
      { x: 0.5, y: 0.55, rx: 0.10, ry: 0.16, c: "#2a4a3a" },
      { x: 0.48, y: 0.32, rx: 0.06, ry: 0.05, c: "#2a3a2a" },
      { x: 0.48, y: 0.32, rx: 0.05, ry: 0.04, c: "#3a4a3a" },
      { x: 0.72, y: 0.38, rx: 0.18, ry: 0.12, c: "#1a3a2a" },
      { x: 0.72, y: 0.38, rx: 0.16, ry: 0.10, c: "#2a4a3a" },
      { x: 0.20, y: 0.30, rx: 0.10, ry: 0.08, c: "#1a3a2a" },
      { x: 0.20, y: 0.30, rx: 0.08, ry: 0.06, c: "#2a4a3a" },
      { x: 0.28, y: 0.60, rx: 0.04, ry: 0.10, c: "#1a3a2a" },
      { x: 0.28, y: 0.60, rx: 0.03, ry: 0.08, c: "#2a4a3a" },
      { x: 0.88, y: 0.72, rx: 0.03, ry: 0.03, c: "#2a3a2a" },
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
      new THREE.MeshPhongMaterial({ map: texture, emissive: new THREE.Color(0x0a1a1a), emissiveIntensity: 0.15, roughness: 0.6 })
    );
    scene.add(earth);
    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 40, 24),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0x1a4a3a, transparent: true, opacity: 0.12 })
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
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000 * 3; i++) starPos[i] = (Math.random() - 0.5) * 40;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.7 })));

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
    scene.add(cityGroup);

    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const p = phaseRef.current; const dt = clock.getElapsedTime();
      const breathe = 1 + Math.sin(dt * 0.5) * 0.03;
      camera.position.z = (3.2 - Math.min(p, 2) * 0.5) * breathe;
      const rot = 0.002 + Math.min(p, 3) * 0.0008;
      earth.rotation.y += rot; grid.rotation.y += rot * 1.1; atmosphere.rotation.y += rot * 0.8;
      cityGroup.rotation.y += rot * 0.9;
      atmoMat.uniforms.time.value = dt;
      atmoMat.uniforms.intensity.value = 0.35 + Math.min(p, 3) * 0.1 + Math.sin(dt * 0.8) * 0.05;
      cityGroup.children.forEach(child => {
        if (child.type === "Mesh" && child.geometry?.type === "RingGeometry" && child !== hlRing) {
          const t = (child.userData?.phase || 0);
          child.userData.phase = t + (child.userData?.speed || 0.008);
          const s = 1 + Math.sin(t) * 0.4;
          child.scale.set(s, s, 1);
        }
      });
      dotMeshes.forEach((d, i) => {
        const pulse = 1 + Math.sin(dt * 2 + i * 0.5) * 0.2;
        d.scale.set(pulse, pulse, pulse);
      });
      hlDot.visible = p >= 3; hlRing.visible = p >= 3;
      if (hlRing.visible) {
        const s = 1 + Math.sin(dt * 2) * 0.6; hlRing.scale.set(s, s, 1);
        hlRing.material.opacity = 0.3 + Math.sin(dt * 3) * 0.4;
      }
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); container.removeChild(renderer.domElement); renderer.dispose(); };
  }, []);
  return <div ref={containerRef} className="w-full h-full" />;
}

// --- Scroll-driven demo ---
function ScrollDemo() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const accumRef = useRef(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Wheel interceptor: scroll input drives the animation, not the page
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    let ticking = false;

    const onWheel = (e) => {
      if (phaseRef.current >= 3) return; // done, let page scroll normally

      e.preventDefault();
      e.stopPropagation();

      accumRef.current += Math.abs(e.deltaY) * 0.6;

      const threshold = 150;
      const p = phaseRef.current;

      if (accumRef.current >= threshold) {
        accumRef.current = 0;
        const next = Math.min(3, p + 1);
        phaseRef.current = next;
        setPhase(next);
        setPhaseProgress(0);
      } else {
        setPhaseProgress(accumRef.current / threshold);
      }

      ticking = false;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Auto-advance phase progress when not scrolling
  useEffect(() => {
    if (phase >= 3) return;
    const interval = setInterval(() => {
      setPhaseProgress(p => Math.min(1, p + 0.02));
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  const displayPhase = phase;
  const globePhase = Math.min(3, phase);

  // Typing
  const searchText = "patates";
  const typedLen = displayPhase >= 1 ? Math.min(searchText.length, Math.floor(phaseProgress * searchText.length)) : 0;
  const typed = searchText.slice(0, typedLen);

  const searchOpacity = displayPhase >= 1 ? Math.min(1, phaseProgress * 2) : 0;
  const markersProgress = displayPhase >= 2 ? Math.min(1, phaseProgress * 1.5) : 0;
  const resultProgress = displayPhase >= 3 ? Math.min(1, phaseProgress * 2) : 0;

  return (
    <section ref={sectionRef} className="relative">
      <div ref={innerRef} className="h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Phase labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {["Découvrir", "Chercher", "Trouver", "Obtenir"].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: displayPhase >= i ? '#34d399' : 'rgba(255,255,255,0.15)',
                  boxShadow: displayPhase >= i ? '0 0 6px rgba(52,211,153,0.5)' : 'none',
                }}
              />
              <span
                className="text-[10px] uppercase tracking-wider transition-all duration-500"
                style={{ color: displayPhase >= i ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.25)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="relative w-full h-full max-w-7xl mx-auto px-6 flex items-center">
          {/* LEFT: Globe */}
          <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 lg:p-8">
            <div className="relative w-full h-full max-h-[500px]">
              <Globe3D phase={globePhase} />
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center pl-8">
            {/* Header text — always visible */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles size={12} className="text-emerald-400" />
                <span className="text-xs text-white/70">Tu cherches un produit ou service autour de toi ?</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Omni</span>
                <span className="text-white/90 block">Tout près de chez toi.</span>
              </h2>
              <p className="text-white/40 text-sm mt-3 max-w-sm">
                Omni est là pour te montrer les vendeurs et prestataires autour de toi.
              </p>
            </div>

            {/* Phase content */}
            <div className="space-y-6">
              {/* Phase 1: Search bar */}
              <div
                className="transition-all duration-500"
                style={{
                  opacity: searchOpacity,
                  transform: `translateY(${(1 - searchOpacity) * 20}px)`,
                }}
              >
                <div className="flex items-center bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3.5 shadow-2xl">
                  <Search size={16} className="text-emerald-400 mr-3 shrink-0" />
                  <span className="flex-1 text-white/80 text-sm font-light tracking-wide">
                    {typed}
                    <span className={`animate-pulse text-emerald-400 ${typedLen >= searchText.length ? 'opacity-0' : ''}`}>|</span>
                  </span>
                  <Mic size={14} className="text-white/30 shrink-0" />
                </div>
              </div>

              {/* Phase 2: Markers */}
              <div
                className="transition-all duration-500"
                style={{
                  opacity: markersProgress,
                  transform: `translateY(${(1 - markersProgress) * 20}px)`,
                }}
              >
                <div className="space-y-3">
                  {[
                    { name: "Marché de Bè", product: "Patates · 500 FCFA/kg", dist: "120m", delay: 0 },
                    { name: "Ama Market", product: "Patates · 400 FCFA/kg", dist: "250m", delay: 0.2 },
                    { name: "Mariam Boutique", product: "Patates · 600 FCFA/kg", dist: "400m", delay: 0.4 },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                      style={{
                        opacity: Math.max(0, Math.min(1, (markersProgress - m.delay) / 0.2)),
                        transform: `translateX(${(1 - Math.max(0, Math.min(1, (markersProgress - m.delay) / 0.2))) * 30}px)`,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center ${i === 0 ? 'bg-emerald-500' : 'bg-emerald-500/70'}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90">{m.name}</p>
                        <p className="text-xs text-white/40">{m.product}</p>
                      </div>
                      <span className="text-xs text-white/30 shrink-0">{m.dist}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 3: Result */}
              <div
                className="transition-all duration-500"
                style={{
                  opacity: resultProgress,
                  transform: `translateY(${(1 - resultProgress) * 20}px)`,
                }}
              >
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <p className="text-base font-medium text-white/90 mb-3">
                    <span className="text-emerald-400 font-bold">4 vendeurs</span> trouvés
                  </p>
                  <p className="text-sm text-white/40 mb-4">Patates disponibles autour de toi. Prix, distance, disponibilité.</p>
                  <a href="/map"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all"
                  >
                    Voir sur la carte
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: simple overlay text */}
          <div className="lg:hidden absolute bottom-8 left-4 right-4 z-10 pointer-events-none">
            <div
              className="text-center transition-all duration-500"
              style={{ opacity: 1 - Math.min(1, progress * 3) }}
            >
              <p className="text-white/80 text-sm font-medium">Omni. Tout près de chez toi.</p>
              <p className="text-white/30 text-xs mt-1">Scrolle pour voir</p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(p => (
              <div
                key={p}
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: displayPhase >= p ? '#34d399' : 'rgba(255,255,255,0.1)',
                  transform: displayPhase >= p ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {displayPhase < 3 && (
            <span className="text-[10px] text-white/20 animate-bounce mt-1">↓ Scrolle</span>
          )}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleExploreClick = (e) => { if (!user) { e.preventDefault(); setShowAuthModal(true); } };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Globe className="text-white" size={20} />
              </div>
              <span className="text-xl font-semibold tracking-tight">Omni</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
              <a href="/map" className="hover:text-white transition-colors">Explorer</a>
              <a href="/vendor/onboarding" className="hover:text-white transition-colors">Je suis vendeur</a>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <a href="/map" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm transition-all">Explorer</a>
              ) : (
                <>
                  <a href="/auth" className="px-4 py-2.5 rounded-xl text-white/80 hover:text-white text-sm font-medium transition-all">Connexion</a>
                  <a href="/auth" className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/10">S'inscrire</a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* SCROLL DEMO — everything happens here */}
      <ScrollDemo />

      {/* PROBLEM */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Le vrai problème</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-8 leading-tight">
            Autour de toi, des gens vendent des choses.<br />
            Mais tu ne sais pas qu'ils existent.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Pas de boutique en ligne. Pas d'enseigne. Pas de pub.
            Pourtant, ils sont là, où que tu ailles.
            <span className="text-emerald-400/80 block mt-2 font-medium">Omni est là pour te montrer ce qui existe autour de toi.</span>
          </p>
        </div>
      </section>

      {/* MARKET */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">$800 Mrd</p>
              <p className="text-white/50 mt-3">Commerce informel en Afrique</p>
            </div>
            <div className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">100M+</p>
              <p className="text-white/50 mt-3">Vendeurs et prestataires invisibles</p>
            </div>
            <div className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">30s</p>
              <p className="text-white/50 mt-3">Pour trouver un produit et contacter le vendeur</p>
            </div>
          </div>
        </div>
      </section>

      {/* TWO SIDES */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Pour tout le monde</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-6">Un outil, deux façons de l'utiliser</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
              <ShoppingBag size={28} className="text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Je cherche quelque chose</h3>
              <ul className="space-y-3 text-white/50 text-sm">
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je tape ce que je veux, on me dit qui l'a</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je vois le prix et la distance</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je vérifie la disponibilité en 1 tap</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> La carte me guide avec la voix</li>
              </ul>
            </div>
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
              <Store size={28} className="text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Je vends quelque chose</h3>
              <ul className="space-y-3 text-white/50 text-sm">
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> On fait connaître ton commerce à ceux qui cherchent</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Zéro contenu à créer, on s'occupe de tout</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Reçois les demandes des clients en direct</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Réponds OUI ou NON, c'est tout</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-white/5 to-blue-500/10 border border-white/10 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Prêt à découvrir ce qui existe autour de toi ?</h2>
              <p className="text-white/50 mb-10 max-w-lg mx-auto">Omni est là pour te montrer ce qui existe autour de toi.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={user ? "/map" : "/auth"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg transition-all">
                  {user ? "Ouvrir la carte" : "Créer un compte"}
                  <ChevronRight size={20} />
                </a>
                <a href="/vendor/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all">
                  Devenir vendeur
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="text-white" size={16} />
            </div>
            <span className="font-semibold">Omni</span>
          </div>
          <p className="text-sm text-white/30">© 2026 Omni. On te montre les commerces près de chez toi.</p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
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
              className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a1a] border border-white/10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Connexion requise</h3>
              <p className="text-white/50 mb-8">Crée un compte pour explorer la carte.</p>
              <div className="flex flex-col gap-3">
                <a href="/auth" className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all">Se connecter</a>
                <a href="/auth" className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">Créer un compte</a>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors">Annuler</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
