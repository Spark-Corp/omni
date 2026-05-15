"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, MapPin, ArrowRight, Sparkles, Shield, Smartphone,
  ChevronRight, Search, MessageCircle, Store, Users,
  Eye, ShoppingBag, Navigation, Mic,
} from "lucide-react";
import * as THREE from "three";
import useAuth from "@/utils/useAuth";

function Globe3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Earth texture — canvas-drawn continents
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048;
    texCanvas.height = 1024;
    const ctx = texCanvas.getContext("2d");
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, 2048, 1024);

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
      ctx.beginPath();
      ctx.ellipse(c.x * 2048, c.y * 1024, c.rx * 2048, c.ry * 1024, 0, 0, Math.PI * 2);
      ctx.fillStyle = c.c;
      ctx.fill();
    }

    const cities = [
      { lon: 1.22, lat: 6.13 }, { lon: -3.99, lat: 5.35 },
      { lon: 3.38, lat: 6.45 }, { lon: 11.50, lat: 3.87 },
      { lon: 17.46, lat: -12.34 }, { lon: 13.20, lat: 9.18 },
      { lon: -1.69, lat: 9.40 }, { lon: 1.48, lat: 6.63 },
      { lon: 2.34, lat: 6.66 }, { lon: -0.23, lat: 14.45 },
    ];

    for (const city of cities) {
      const x = ((city.lon + 180) / 360) * 2048;
      const y = ((90 - city.lat) / 180) * 1024;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.9)");
      grad.addColorStop(0.5, "rgba(16, 185, 129, 0.3)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x - 12, y - 12, 24, 24);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#34d399";
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(texCanvas);
    const earthGeo = new THREE.SphereGeometry(1, 80, 80);
    const earthMat = new THREE.MeshPhongMaterial({
      map: texture, emissive: new THREE.Color(0x0a1a1a),
      emissiveIntensity: 0.1, roughness: 0.7, metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    const gridGeo = new THREE.SphereGeometry(1.01, 40, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      wireframe: true, color: 0x1a3a3a, transparent: true, opacity: 0.15,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    scene.add(grid);

    const atmoGeo = new THREE.SphereGeometry(1.18, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide,
      uniforms: { color: { value: new THREE.Color(0x10b981) } },
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vNormal; uniform vec3 color; void main() { float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 3.5); gl_FragColor = vec4(color, intensity * 0.35); }`,
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) starPos[i] = (Math.random() - 0.5) * 30;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.6 }));
    scene.add(stars);

    const dotGroup = new THREE.Group();
    const city3D = cities.map(c => {
      const phi = (90 - c.lat) * Math.PI / 180;
      const theta = (c.lon + 180) * Math.PI / 180;
      return {
        x: -Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      };
    });

    city3D.forEach(c => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x34d399 })
      );
      dot.position.set(c.x * 1.01, c.y * 1.01, c.z * 1.01);
      dotGroup.add(dot);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.04, 16),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
      );
      ring.position.set(c.x * 1.05, c.y * 1.05, c.z * 1.05);
      ring.lookAt(0, 0, 0);
      ring.userData = { speed: 0.005 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2 };
      dotGroup.add(ring);

      const gc = document.createElement("canvas");
      gc.width = 32; gc.height = 32;
      const gctx = gc.getContext("2d");
      const g = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(52, 211, 153, 0.6)");
      g.addColorStop(1, "rgba(52, 211, 153, 0)");
      gctx.fillStyle = g;
      gctx.fillRect(0, 0, 32, 32);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending,
      }));
      glow.scale.set(0.08, 0.08, 1);
      glow.position.set(c.x * 1.02, c.y * 1.02, c.z * 1.02);
      dotGroup.add(glow);
    });
    scene.add(dotGroup);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      earth.rotation.y += 0.0015;
      grid.rotation.y += 0.0015;
      atmosphere.rotation.y += 0.0012;
      stars.rotation.y -= 0.0001;
      dotGroup.rotation.y += 0.0015;
      dotGroup.children.forEach(child => {
        if (child.type === "Mesh" && child.geometry?.type === "RingGeometry") {
          const t = (child.userData?.phase || 0);
          child.userData.phase = t + (child.userData?.speed || 0.005);
          const s = 1 + Math.sin(t) * 0.3;
          child.scale.set(s, s, 1);
          child.material.opacity = 0.3 + Math.sin(t) * 0.2;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); container.removeChild(renderer.domElement); renderer.dispose(); };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}

// Scroll-triggered map demo
function ScrollMapDemo() {
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const ratio = entry.intersectionRatio;
        // Phase 0: initial, Phase 1: search appears, Phase 2: text typed, Phase 3: markers pop
        if (ratio > 0.1) setPhase(1);
        if (ratio > 0.4) setPhase(2);
        if (ratio > 0.7) setPhase(3);
      },
      { threshold: [0.1, 0.4, 0.7] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const searchText = "patates";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (phase < 2) { setTyped(""); return; }
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(searchText.slice(0, i));
      if (i >= searchText.length) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div ref={sectionRef} className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-white/5 bg-[#050510]">
      {/* Map background — mimics CartoDB dark tiles */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1a2e] to-[#050510]" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Search bar — animates in at phase 1 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md"
      >
        <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 shadow-2xl">
          <Search size={16} className="text-emerald-400 mr-3" />
          <span className="flex-1 text-white/80 text-sm font-light">
            {typed}<span className="animate-pulse text-emerald-400">|</span>
          </span>
          <Mic size={14} className="text-white/30" />
        </div>
      </motion.div>

      {/* Vendor markers — appear at phase 3 */}
      {phase >= 3 && (
        <>
          {[{ top: '35%', left: '30%' }, { top: '45%', left: '55%' }, { top: '60%', left: '40%' }, { top: '30%', left: '60%' }].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
              className="absolute z-10"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className={`w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center shadow-lg ${i === 0 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-emerald-500/80'}`}>
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              {i === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 whitespace-nowrap"
                >
                  <p className="text-[11px] text-white/80">Patates · 500 FCFA/kg</p>
                </motion.div>
              )}
            </motion.div>
          ))}
          {/* Result card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-5 py-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10"
          >
            <p className="text-sm text-white/80">
              <span className="text-emerald-400 font-semibold">4 vendeurs</span> ont des patates près de chez toi
            </p>
          </motion.div>
        </>
      )}

      {/* Phase indicator */}
      <div className="absolute bottom-6 right-6 flex gap-1.5">
        {[1, 2, 3].map(p => (
          <div key={p} className={`w-2 h-2 rounded-full transition-all duration-500 ${phase >= p ? 'bg-emerald-400' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleExploreClick = (e) => { if (!user) { e.preventDefault(); setShowAuthModal(true); } };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Navigation */}
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

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
              >
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-sm text-white/70">Ils ne sont pas sur Google Maps</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Omni</span>
                <span className="text-white/90 block mt-2">Tout près de chez toi.</span>
              </h1>
              <p className="text-lg text-white/50 mb-10 max-w-lg leading-relaxed">
                Des milliers de vendeurs et services autour de toi ne sont nulle part en ligne. 
                On les cartographie un par un pour que tu trouves tout ce qu'il te faut.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.a href="/map" onClick={handleExploreClick}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg transition-all"
                >
                  Explorer la carte
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a href="/vendor/onboarding"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all"
                >
                  <MapPin size={20} />
                  Devenir vendeur
                </motion.a>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Vendeurs en temps réel</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Shield size={14} />
                  <span>100% gratuit</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Smartphone size={14} />
                  <span>Zéro inscription pour les vendeurs</span>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[450px] lg:h-[580px]"
            >
              <Globe3D />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-6 p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <MapPin size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">12 vendeurs</p>
                    <p className="text-[10px] text-white/40">dans ton quartier</p>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 left-8 p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Navigation size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">2 min à pied</p>
                    <p className="text-[10px] text-white/40">du vendeur le plus proche</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section className="py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Le vrai problème</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-8 leading-tight">
            Dans ton quartier, il y a des vendeurs.<br />
            Mais ils n'existent pas en ligne.
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Pas sur Google Maps. Pas de page Facebook. Pas de boutique en ligne. 
            Pourtant, ils sont là, à vendre du riz, réparer des téléphones, coudre des habits. 
            Pour les trouver, tu marches, tu demandes, tu espères. On arrête ça.
          </p>
        </div>
      </Section>

      {/* SCROLL DEMO */}
      <Section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Vois comment ça marche</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-4">Scrolle pour voir la démo</h2>
          </div>
          <ScrollMapDemo />
          <p className="text-center text-white/30 text-sm mt-6">La barre de recherche apparaît, le texte s'écrit, les vendeurs apparaissent.</p>
        </div>
      </Section>

      {/* MARKET */}
      <Section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">$800 Mrd</p>
              <p className="text-white/40 mt-3">Commerce informel en Afrique</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">100M+</p>
              <p className="text-white/40 mt-3">Vendeurs sans aucune présence en ligne</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="p-10">
              <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">30s</p>
              <p className="text-white/40 mt-3">Pour trouver un produit et contacter le vendeur</p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* TWO SIDES */}
      <Section className="py-28 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Pour tout le monde</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-6">Un outil, deux façons de l'utiliser</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10"
            >
              <ShoppingBag size={28} className="text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Je cherche quelque chose</h3>
              <ul className="space-y-3 text-white/50 text-sm">
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je tape ce que je veux, on me dit qui l'a</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je vois le prix et la distance</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> Je vérifie la disponibilité en 1 tap</li>
                <li className="flex items-start gap-3"><span className="text-emerald-400 mt-0.5">→</span> La carte me guide avec la voix</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10"
            >
              <Store size={28} className="text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Je vends quelque chose</h3>
              <ul className="space-y-3 text-white/50 text-sm">
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> On cartographie mon commerce gratuitement</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Zéro contenu à créer, rien à apprendre</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> On m'avertit quand quelqu'un cherche mes produits</li>
                <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Je réponds OUI ou NON, c'est tout</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-white/5 to-blue-500/10 border border-white/10 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Prêt à trouver ce qu'il te faut ?</h2>
              <p className="text-white/50 mb-10 max-w-lg mx-auto">
                Les vendeurs de ton quartier n'attendent que toi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={user ? "/map" : "/auth"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg transition-all"
                >
                  {user ? "Ouvrir la carte" : "Créer un compte"}
                  <ChevronRight size={20} />
                </a>
                <a href="/vendor/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all"
                >
                  Devenir vendeur
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="text-white" size={16} />
            </div>
            <span className="font-semibold">Omni</span>
          </div>
          <p className="text-sm text-white/30">© 2026 Omni. On cartographie les commerces près de chez toi.</p>
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
