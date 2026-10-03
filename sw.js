// オフラインでも開けるようにアプリ本体をキャッシュ。マシン画像は見たものだけ保存。
const V = 'gymlog-2026.10.03-4';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'kongou.js', 'exercises.js', 'muscles.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== 'gymlog-img').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) {
    // ネット優先。GitHub Pages は10分キャッシュされるので no-cache で毎回確認（変わってなければ304で軽い）
    e.respondWith(fetch(u.href, { cache: 'no-cache' }).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
  } else if (u.hostname.endsWith('kongou-fitness.com')) {
    e.respondWith(caches.open('gymlog-img').then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; }))));
  }
});
