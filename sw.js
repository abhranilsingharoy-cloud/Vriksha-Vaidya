const CACHE_NAME = 'vriksha-vaidya-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/hero.css',
  '/css/scanner.css',
  '/css/disease-info.css',
  '/css/pricing.css',
  '/css/chatbot.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/disease-db.js',
  '/js/ai-botanist.js',
  '/js/animations.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache API calls (like the chatbot)
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
