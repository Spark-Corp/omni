import { createServer } from 'http';

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:3001`);
  
  if (url.pathname === '/') {
    // Servir la landing page OMNI originale avec animations
    const landingPage = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OMNI - La carte vivante du commerce de proximité</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/scrollreveal@4.0.0/dist/scrollreveal.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        .bg-grid-pattern {
            background-image: radial-gradient(circle, #10b981 1px, transparent 1px);
            background-size: 50px 50px;
        }
        
        .globe-container {
            width: 400px;
            height: 400px;
            position: relative;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 0 50px rgba(16, 185, 129, 0.3);
            transform: rotateX(-15deg);
            transform-style: preserve-3d;
            animation: rotateGlobe 30s linear infinite;
        }
        
        .globe-map {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
        
        @keyframes rotateGlobe {
            from { transform: rotateY(0deg) rotateX(-15deg); }
            to { transform: rotateY(360deg) rotateX(-15deg); }
        }
        
        .scroll-reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease;
        }
        
        .scroll-reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card {
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="bg-white">
    <!-- Hero Section with 3D Scroll -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div class="container mx-auto px-4 py-20 relative z-10">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <!-- Left: Value Prop -->
                <div class="scroll-reveal">
                    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        La carte vivante du{" "}
                        <span class="text-emerald-600">commerce de proximité</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8">
                        Trouvez ce que vous cherchez avant de vous déplacer. En temps
                        réel. Partout en Afrique.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 mb-12">
                        <a href="/map" class="inline-block">
                            <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                                <svg class="inline mr-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                Chercher un produit
                            </button>
                        </a>
                        <a href="/vendor/dashboard" class="inline-block">
                            <button class="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                                <svg class="inline mr-2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Devenir vendeur
                            </button>
                        </a>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <div class="text-3xl font-bold text-emerald-600">5km</div>
                            <div class="text-sm text-gray-600">Rayon de recherche</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-emerald-600">&lt;3min</div>
                            <div class="text-sm text-gray-600">Inscription vendeur</div>
                        </div>
                        <div>
                            <div class="text-3xl font-bold text-emerald-600">100%</div>
                            <div class="text-sm text-gray-600">Gratuit</div>
                        </div>
                    </div>
                </div>

                <!-- Right: Interactive 3D Globe -->
                <div class="relative h-[600px] flex items-center justify-center scroll-reveal">
                    <div class="globe-container">
                        <div id="globe-map" class="globe-map"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16 scroll-reveal">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">
                    Comment ça marche ?
                </h2>
                <p class="text-xl text-gray-600">
                    Un parcours simple, rapide, efficace
                </p>
            </div>

            <div class="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Cherchez</h3>
                    <p class="text-gray-600">Texte, voix ou photo</p>
                </div>
                
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Trouvez</h3>
                    <p class="text-gray-600">3 vendeurs les plus proches</p>
                </div>
                
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Vérifiez</h3>
                    <p class="text-gray-600">Stock disponible avant de partir</p>
                </div>
                
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Naviguez</h3>
                    <p class="text-gray-600">Guidage temps réel</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <!-- For Customers -->
                <div class="scroll-reveal">
                    <h3 class="text-3xl font-bold mb-6 text-gray-900">
                        Pour les clients
                    </h3>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Économisez temps et argent</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Vérifiez la disponibilité avant de partir</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Supportez l'économie locale</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Recherche vocale en langues locales</span>
                        </li>
                    </ul>
                </div>

                <!-- For Vendors -->
                <div class="scroll-reveal">
                    <h3 class="text-3xl font-bold mb-6 text-gray-900">
                        Pour les vendeurs
                    </h3>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Soyez découvrable sans Facebook ni site web</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Recevez des clients ciblés et qualifiés</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Contrôle total : on/off en un tap</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Interface vocale en langue locale</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <svg class="text-emerald-600 flex-shrink-0 mt-1" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-gray-700">Visibilité entièrement gratuite</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Accessibility Features -->
    <section class="py-20 bg-emerald-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16 scroll-reveal">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">
                    Accessible à tous
                </h2>
                <p class="text-xl text-gray-600">
                    Conçu pour l'Afrique, par des Africains
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Recherche vocale</h3>
                    <p class="text-gray-600">Parlez votre langue, on vous comprend</p>
                </div>
                
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Recherche par image</h3>
                    <p class="text-gray-600">Prenez une photo, trouvez le produit</p>
                </div>
                
                <div class="text-center scroll-reveal feature-card bg-white p-8 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Optimisé mobile</h3>
                    <p class="text-gray-600">Fonctionne sur tous les téléphones</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div class="container mx-auto px-4 text-center">
            <div class="scroll-reveal">
                <h2 class="text-4xl font-bold mb-6">
                    Prêt à rejoindre la révolution du commerce local ?
                </h2>
                <p class="text-xl mb-8 max-w-2xl mx-auto">
                    Des milliers de vendeurs et clients utilisent déjà OMNI pour transformer leur expérience commerciale.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/test-auth.html" class="inline-block">
                        <button class="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                            Commencer maintenant
                        </button>
                    </a>
                    <a href="#vendeurs" class="inline-block">
                        <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all">
                            En savoir plus
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center mb-4">
                        <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">O</span>
                        </div>
                        <span class="ml-3 text-xl font-bold">OMNI</span>
                    </div>
                    <p class="text-gray-400">La carte vivante du commerce de proximité</p>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Produit</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li>Recherche vocale</li>
                        <li>Recherche par image</li>
                        <li>Carte interactive</li>
                        <li>Dashboard vendeur</li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Services</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li>Pour les clients</li>
                        <li>Pour les vendeurs</li>
                        <li>API développeurs</li>
                        <li>Support 24/7</li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold mb-4">Contact</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li>+228 12 34 56 78</li>
                        <li>contact@omni.africa</li>
                        <li>Lomé, Togo</li>
                        <li>Partout en Afrique</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2026 OMNI. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script>
        // Initialize 3D Globe
        let globeMap;
        
        function initGlobe() {
            globeMap = L.map('globe-map', {
                center: [6.1319, 1.2228],
                zoom: 2,
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false
            });
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: ''
            }).addTo(globeMap);
            
            // Add vendor markers
            const vendors = [
                { name: "Kofi Electronics", lat: 6.1319, lon: 1.2228 },
                { name: "Ama Market Stand", lat: 9.0579, lon: 2.5387 },
                { name: "Mariam Boutique", lat: -4.4419, lon: 15.2663 },
                { name: "Tech Store Plus", lat: 36.8065, lon: 10.1815 },
                { name: "Fashion Hub", lat: 48.8566, lon: 2.3522 }
            ];
            
            vendors.forEach(vendor => {
                L.marker([vendor.lat, vendor.lon])
                    .addTo(globeMap)
                    .bindPopup(vendor.name);
            });
        }
        
        // Scroll reveal animations
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        function reveal() {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', reveal);
        window.addEventListener('load', () => {
            reveal();
            initGlobe();
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(landingPage);
  } else if (url.pathname === '/map') {
    // Rediriger vers la vraie page React /map existante
    res.writeHead(302, { 'Location': 'http://localhost:3000/map' });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

server.listen(3001, () => {
  console.log('🚀 Serveur OMNI lancé sur http://localhost:3001');
  console.log('📱 Landing page: http://localhost:3001');
});
