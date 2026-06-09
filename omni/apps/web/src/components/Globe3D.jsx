"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

// Simple CSS 3D Globe - compatible sans Three.js
export default function Globe3D() {
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (globeRef.current && mounted) {
      // Simple rotation animation
      let rotation = 0;
      const interval = setInterval(() => {
        rotation += 0.5;
        if (globeRef.current) {
          globeRef.current.style.transform = `rotateY(${rotation}deg)`;
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="relative">
        {/* Globe container with 3D transforms */}
        <div 
          ref={globeRef}
          className="relative w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500 to-emerald-600 shadow-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateY(0deg) rotateX(-15deg)',
            transition: 'transform 0.1s linear'
          }}
        >
          {/* Continents representation */}
          <div className="absolute inset-4 rounded-full bg-green-600 opacity-30"></div>
          <div className="absolute top-8 left-12 w-16 h-12 bg-green-700 rounded-full opacity-40"></div>
          <div className="absolute top-20 right-8 w-20 h-16 bg-green-700 rounded-full opacity-40"></div>
          <div className="absolute bottom-12 left-16 w-24 h-20 bg-green-700 rounded-full opacity-40"></div>
          
          {/* Atmosphere glow */}
          <div className="absolute -inset-4 rounded-full bg-blue-400 opacity-20 blur-xl"></div>
          
          {/* Location markers */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-orange-500 rounded-full shadow-lg animate-pulse"></div>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 400 - 50}px`,
              top: `${Math.random() * 400 - 50}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Overlay text */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold mb-1">Omni en Afrique</h3>
          <p className="text-sm opacity-80">Commerce de proximité en temps réel</p>
        </div>
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Abidjan</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Accra</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Nigeria</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Congo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
