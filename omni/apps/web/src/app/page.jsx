"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  MapPin,
  Search,
  Phone,
  CheckCircle,
  Navigation,
  Clock,
  Users,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const phoneY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const phoneRotateX = useTransform(scrollYProgress, [0, 0.3], [25, 0]);
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const mapScale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);
  const mapY = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);

  return (
    <div ref={containerRef} className="bg-white">
      {/* Hero Section with 3D Scroll */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Value Prop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                La carte vivante du{" "}
                <span className="text-emerald-600">commerce de proximité</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Trouvez ce que vous cherchez avant de vous déplacer. En temps
                réel. Partout en Afrique.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a href="/map">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                    <Search className="inline mr-2" size={20} />
                    Chercher un produit
                  </button>
                </a>
                <a href="/vendor">
                  <button className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                    <MapPin className="inline mr-2" size={20} />
                    Devenir vendeur
                  </button>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">5km</div>
                  <div className="text-sm text-gray-600">
                    Rayon de recherche
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">
                    &lt;3min
                  </div>
                  <div className="text-sm text-gray-600">
                    Inscription vendeur
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">
                    100%
                  </div>
                  <div className="text-sm text-gray-600">Gratuit</div>
                </div>
              </div>
            </motion.div>

            {/* Right: 3D Animated Phone */}
            <motion.div
              style={{
                y: phoneY,
                rotateX: phoneRotateX,
                opacity: phoneOpacity,
              }}
              className="relative h-[600px] flex items-center justify-center perspective-1000"
            >
              <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-800">
                {/* Phone Screen */}
                <div className="absolute inset-0 bg-white overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-8 bg-gray-100 flex items-center justify-between px-6 text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="relative h-full bg-gradient-to-br from-green-100 to-emerald-200">
                    {/* Simulated Map Pins */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/4 left-1/3"
                    >
                      <MapPin
                        className="text-emerald-600"
                        size={32}
                        fill="currentColor"
                      />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                      className="absolute top-1/2 right-1/4"
                    >
                      <MapPin
                        className="text-emerald-600"
                        size={32}
                        fill="currentColor"
                      />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                      className="absolute bottom-1/3 left-1/2"
                    >
                      <MapPin
                        className="text-emerald-600"
                        size={32}
                        fill="currentColor"
                      />
                    </motion.div>

                    {/* Search Bar */}
                    <div className="absolute top-12 left-4 right-4 bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
                      <Search size={20} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Riz, téléphone, pagne..."
                        className="flex-1 outline-none text-sm"
                        disabled
                      />
                    </div>

                    {/* Bottom Sheet Preview */}
                    <motion.div
                      initial={{ y: 400 }}
                      animate={{ y: 300 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-4"
                    >
                      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      <div className="text-sm font-semibold mb-2">
                        Ama Market Stand
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        250m • Alimentation
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold">
                        Riz local - 2500 FCFA
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            style={{ scale: mapScale, y: mapY }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Un parcours simple, rapide, efficace
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Search,
                title: "Cherchez",
                desc: "Texte, voix ou photo",
                color: "emerald",
              },
              {
                icon: MapPin,
                title: "Trouvez",
                desc: "3 vendeurs les plus proches",
                color: "green",
              },
              {
                icon: CheckCircle,
                title: "Vérifiez",
                desc: "Stock disponible avant de partir",
                color: "teal",
              },
              {
                icon: Navigation,
                title: "Naviguez",
                desc: "Guidage temps réel",
                color: "cyan",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div
                  className={`w-16 h-16 bg-${step.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <step.icon className={`text-${step.color}-600`} size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Split */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* For Buyers */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                Pour les acheteurs
              </h3>
              <ul className="space-y-4">
                {[
                  "Trouvez ce que vous cherchez sans vous déplacer à l'aveugle",
                  "Comparez les prix des vendeurs proches",
                  "Confirmez le stock avant de partir",
                  "Navigation temps réel jusqu'au vendeur",
                  "Recherche par voix et image (accessible à tous)",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-emerald-600 flex-shrink-0 mt-1"
                      size={20}
                    />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Vendors */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                Pour les vendeurs
              </h3>
              <ul className="space-y-4">
                {[
                  "Soyez découvrable sans Facebook ni site web",
                  "Recevez des clients ciblés et qualifiés",
                  "Contrôle total : on/off en un tap",
                  "Interface vocale en langue locale",
                  "Visibilité entièrement gratuite",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-emerald-600 flex-shrink-0 mt-1"
                      size={20}
                    />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Accessible à tous
            </h2>
            <p className="text-xl text-gray-600">
              Conçu pour l'Afrique, par des Africains
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Phone,
                title: "Recherche vocale",
                desc: "Parlez en français ou en langue locale",
              },
              {
                icon: Smartphone,
                title: "Recherche image",
                desc: "Prenez une photo de l'article",
              },
              {
                icon: Clock,
                title: "Fonctionne offline",
                desc: "Catalogue disponible sans connexion",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <feature.icon className="text-emerald-600 mb-4" size={40} />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à trouver ce que vous cherchez ?
            </h2>
            <p className="text-xl mb-8 text-emerald-100">
              Rejoignez des milliers d'acheteurs et vendeurs en Afrique de
              l'Ouest
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/map">
                <button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all">
                  Commencer maintenant
                </button>
              </a>
              <a href="/vendor">
                <button className="border-2 border-white text-white hover:bg-emerald-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                  Inscrire ma boutique
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-white mb-4">Omni</div>
          <p className="mb-4">Spark • Mars 2026</p>
          <p className="text-sm">
            Construire des solutions logicielles pour le développement de
            l'Afrique
          </p>
        </div>
      </footer>
    </div>
  );
}
