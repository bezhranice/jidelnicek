// Lock In: offline cache
const V = "kj-v11";
const SHELL = ["./", "index.html", "supabase.js", "manifest.webmanifest", "recepty.json", "icon-180.png", "icon-192.png", "icon-512.png", "cviky.json", "srovnani.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const put = r => { if (r && r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
  } else if (u.host.endsWith("fonts.googleapis.com") || u.host.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(put)));
  }
});
// notifikace (Trénink)
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "Lock In", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Lock In", { body: d.body || "", tag: d.tag || undefined, icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => { for (const w of ws) if ("focus" in w) return w.focus(); return clients.openWindow((e.notification.data && e.notification.data.url) || "./"); }));
});
