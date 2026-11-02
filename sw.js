/* sw.js — service worker: guarda o app no aparelho para abrir offline.
   Troque CACHE (ex.: v2) sempre que publicar uma versão nova, para o celular baixar os arquivos atualizados. */
const CACHE = 'dqd-v2';
const FILES = ['./', './index.html', './css/style.css', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './js/core.js', './js/data.js', './js/audio.js', './js/tts.js', './js/cotonete.js', './js/lab.js', './js/chunks.js', './js/app.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Arquivos do app: cache primeiro. Fontes e Tailwind (outros domínios): rede, guardando uma cópia para a próxima vez.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => hit)));
});
