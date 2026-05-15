"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, MapPin, ArrowRight, Sparkles, Shield, Smartphone,
  ChevronRight, Search, MessageCircle, Store, Users,
  Eye, ShoppingBag, Navigation,
} from "lucide-react";
import * as THREE from "three";
import useAuth from "@/utils/useAuth";

// --- 3D Globe (single instance) ---
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
    const baseZ = 3.2;
    camera.position.z = baseZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);

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
      { lon: -15.98, lat: 18.06 }, { lon: -17.45, lat: 14.72 },
    ];
    for (const city of cities) {
      const x = ((city.lon + 180) / 360) * 2048;
      const y = ((90 - city.lat) / 180) * 1024;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
      g.addColorStop(0, "rgba(16, 185, 129, 0.9)");
      g.addColorStop(0.5, "rgba(16, 185, 129, 0.3)");
      g.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = g;
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

    const atmoMat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide,
      uniforms: { color: { value: new THREE.Color(0x10b981) }, intensity: { value: 0.35 } },
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vNormal; uniform vec3 color; uniform float intensity; void main() { float i = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 3.5); gl_FragColor = vec4(color, i * intensity); }`,
    });
    const atmoGeo = new THREE.SphereGeometry(1.18, 64, 64);
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) starPos[i] = (Math.random() - 0.5) * 30;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.6 }));
    scene.add(stars);

    const cityGroup = new THREE.Group();
    const city3D = cities.map(c => {
      const phi = (90 - c.lat) * Math.PI / 180;
      const theta = (c.lon + 180) * Math.PI / 180;
      return { x: -Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta) };
    });

    const dotMeshes = [];
    city3D.forEach((c, i) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
      dot.position.set(c.x * 1.01, c.y * 1.01, c.z * 1.01);
      cityGroup.add(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.04, 16),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
      ring.position.set(c.x * 1.05, c.y * 1.05, c.z * 1.05);
      ring.lookAt(0, 0, 0);
      ring.userData = { speed: 0.005 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2 };
      cityGroup.add(ring);
      const gc = document.createElement("canvas"); gc.width = 32; gc.height = 32;
      const gctx = gc.getContext("2d");
      const grad = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(52, 211, 153, 0.6)"); grad.addColorStop(1, "rgba(52, 211, 153, 0)");
      gctx.fillStyle = grad; gctx.fillRect(0, 0, 32, 32);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending }));
      glow.scale.set(0.08, 0.08, 1);
      glow.position.set(c.x * 1.02, c.y * 1.02, c.z * 1.02);
      cityGroup.add(glow);
      if (i < 6) dotMeshes.push(dot);
    });

    const target = city3D[0];
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    highlight.position.set(target.x * 1.01, target.y * 1.01, target.z * 1.01);
    highlight.visible = false;
    cityGroup.add(highlight);

    const ringBig = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.08, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    ringBig.position.set(target.x * 1.08, target.y * 1.08, target.z * 1.08);
    ringBig.lookAt(0, 0, 0);
    ringBig.visible = false;
    cityGroup.add(ringBig);
    scene.add(cityGroup);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const p = phaseRef.current;
      const zoom = p === 2 ? 1.8 : p === 1 ? 0.8 : 0;
      camera.position.z = baseZ - zoom * 0.6;
      const rotSpeed = 0.0015 + p * 0.0008;
      earth.rotation.y += rotSpeed;
      grid.rotation.y += rotSpeed;
      atmosphere.rotation.y += rotSpeed * 0.9;
      cityGroup.rotation.y += rotSpeed;
      stars.rotation.y -= 0.0001;
      atmoMat.uniforms.intensity.value = 0.35 + p * 0.12;

      cityGroup.children.forEach(child => {
        if (child.type === "Mesh" && child.geometry?.type === "RingGeometry" && child !== ringBig) {
          const t = (child.userData?.phase || 0);
          child.userData.phase = t + (child.userData?.speed || 0.005);
          const s = 1 + Math.sin(t) * 0.3;
          child.scale.set(s, s, 1);
          child.material.opacity = Math.min(0.6, 0.3 + Math.sin(t) * 0.2 + p * 0.08);
        }
      });
      dotMeshes.forEach((d, i) => {
        const s = p >= 2 ? 1.5 + Math.sin(Date.now() * 0.003 + i) * 0.3 : 1;
        d.scale.set(s, s, s);
      });
      highlight.visible = p >= 3;
      ringBig.visible = p >= 3;
      if (ringBig.visible) {
        const t = Date.now() * 0.002;
        const s = 1 + Math.sin(t) * 0.5;
        ringBig.scale.set(s, s, 1);
        ringBig.material.opacity = 0.3 + Math.sin(t) * 0.3;
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

// --- Scroll phase tracker ---
const useScrollPhase = (stepCount = 4) => {
  const [phase, setPhase] = useState(0);
  const triggersRef = useRef([]);

  const registerTrigger = useCallback((el, phaseIndex) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPhase(p => Math.max(p, phaseIndex)); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    triggersRef.current.push(obs);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? scrollY / max : 0;
      setPhase(Math.min(stepCount - 1, Math.floor(progress * stepCount)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [stepCount]);

  return phase;
};

// --- Reusable section with glass background ---
function FloatSection({ children, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative z-10 py-24 md:py-32 px-6 ${className || ""}`}
    >
      <div className="absolute inset-0 bg-[#050510]/70 backdrop-blur-sm pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">{children}</div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleExploreClick = (e) => { if (!user) { e.preventDefault(); setShowAuthModal(true); } };

  // Single scroll-driven phase (0-6)
  const phase = useScrollPhase(7);

  // Step refs for how-it-works
  const stepRefs = [useRef(null), useRef(null), useRef(null)];

  return (
    <div className="relative min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* NAV — fixed */}
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

      {/* SINGLE GLOBE — fixed, never moves */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Globe3D phase={Math.min(3, phase)} />
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center pt-24">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8"
              >
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-sm text-white/80">Tu cherches un produit ou service autour de toi ?</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Omni</span>
                <span className="text-white/90 block mt-1">Tout près de chez toi.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                Des milliers de vendeurs et fournisseurs de services existent autour de toi.
                Tu ne les connais pas, ils ne sont visibles nulle part.
                On les cartographie pour propulser le commerce local.
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
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all"
                >
                  <MapPin size={20} />
                  Devenir vendeur
                </motion.a>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-white/50"> <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> <span>Vendeurs en temps réel</span> </div>
                <div className="flex items-center gap-2 text-white/50"> <Shield size={14} /> <span>100% gratuit</span> </div>
                <div className="flex items-center gap-2 text-white/50"> <Smartphone size={14} /> <span>Ça marche aussi hors ligne</span> </div>
              </div>
            </motion.div>
            <div className="hidden lg:block" /> {/* spacer */}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <FloatSection>
        <div className="text-center max-w-4xl mx-auto">
          <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Le vrai problème</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-8 leading-tight">
            Autour de toi, des gens vendent des choses.<br />
            Mais tu ne sais pas qu'ils existent.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Pas de boutique en ligne. Pas d'enseigne. Pas de pub.
            Pourtant, ils sont là, où que tu ailles : du riz, du pain, des habits, un réparateur téléphone.
            Pour les trouver, tu marches, tu demandes, tu espères.
            Notre mission : rendre visible tout ce qui existe déjà autour de toi.
          </p>
        </div>
      </FloatSection>

      {/* HOW IT WORKS — scrollytelling steps */}
      <div className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Comment ça marche</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Scrolle, le globe réagit</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-48 md:space-y-64">
            {[
              { icon: Search, title: "Tu cherches", desc: "Tu veux des patates, un réparateur téléphone ou du pagne ? Tu tapes le nom dans Omni. Texte, voix ou photo, comme tu veux." },
              { icon: MapPin, title: "Tu trouves", desc: "La carte montre tous les vendeurs et prestataires autour de toi qui ont ce qu'il te faut. Prix, distance, disponibilité. En un clin d'œil." },
              { icon: MessageCircle, title: "Tu obtiens", desc: "Tu cliques, le vendeur reçoit une notification. Il répond OUI ou NON, même sans savoir lire. La carte te guide jusqu'à lui. Guidage vocal inclus." },
            ].map((step, i) => (
              <div key={i} ref={stepRefs[i]}
                className="min-h-[50vh] flex flex-col justify-center"
              >
                <div className="p-8 md:p-10 rounded-2xl bg-[#050510]/80 backdrop-blur-md border border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-5">
                    <step.icon size={26} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MARKET */}
      <FloatSection>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10">
            <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">$800 Mrd</p>
            <p className="text-white/50 mt-3">Commerce informel en Afrique</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="p-10">
            <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">100M+</p>
            <p className="text-white/50 mt-3">Vendeurs et prestataires invisibles</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="p-10">
            <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent">30s</p>
            <p className="text-white/50 mt-3">Pour trouver un produit et contacter le vendeur</p>
          </motion.div>
        </div>
      </FloatSection>

      {/* TWO SIDES */}
      <FloatSection>
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm uppercase tracking-[0.2em] font-medium">Pour tout le monde</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6">Un outil, deux façons de l'utiliser</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
              <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> On fait connaître ton commerce à ceux qui cherchent près de chez toi</li>
              <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Zéro contenu à créer, on s'occupe de tout</li>
              <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Reçois les demandes des clients en direct</li>
              <li className="flex items-start gap-3"><span className="text-blue-400 mt-0.5">→</span> Réponds OUI ou NON, c'est tout</li>
            </ul>
          </motion.div>
        </div>
      </FloatSection>

      {/* CTA */}
      <FloatSection>
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/10 via-[#050510]/80 to-blue-500/10 border border-white/10 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Prêt à découvrir ce qui existe autour de toi ?</h2>
              <p className="text-white/50 mb-10 max-w-lg mx-auto">
                On cartographie les vendeurs et prestataires de ton quartier. Ceux qui existent mais que personne ne voit.
              </p>
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
      </FloatSection>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#050510]/80 backdrop-blur-sm">
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
