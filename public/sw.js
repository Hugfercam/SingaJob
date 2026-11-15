/* Service worker de SignaJob.
 *
 * Objetivo: que la aplicación abra sin red. No intenta ser un framework de
 * caché: guarda el shell y los recursos estáticos, y para las páginas usa
 * red-primero con la última copia como respaldo.
 *
 * Solo se registra en producción (ver OfflineIndicator).
 */
const VERSION = "signajob-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const PAGES_CACHE = `${VERSION}-pages`;

const PRECACHE = ["/", "/partes", "/panel", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // Los datos personales y los PDF nunca se cachean.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/invitacion/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);

          return cached ?? (await caches.match("/partes")) ?? Response.error();
        }),
    );
    return;
  }

  // Estáticos: red primero y copia como respaldo. Con cache-first, un despliegue
  // nuevo seguía sirviendo CSS y JS viejos mientras el nombre de caché no
  // cambiara. Así se ve siempre lo último y, sin red, sigue funcionando.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch((error) => caches.match(request).then((cached) => cached ?? Promise.reject(error))),
    );
    return;
  }

  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
