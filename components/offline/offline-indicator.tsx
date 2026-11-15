"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { queueSize } from "@/lib/offline/outbox";
import { flushQueue } from "@/lib/offline/sync";

function subscribeToNetwork(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Indicador de conexión y de cambios pendientes.
 *
 * También registra el service worker (solo en producción, porque en desarrollo
 * su caché pelea con el recargado en caliente) y reintenta la cola al volver la
 * red, al abrir la app y cada medio minuto.
 */
export function OfflineIndicator() {
  const router = useRouter();
  const online = useSyncExternalStore(
    subscribeToNetwork,
    () => navigator.onLine,
    () => true,
  );
  const [pending, setPending] = useState(0);

  const refresh = useCallback(async () => {
    setPending(await queueSize());
  }, []);

  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }

    const result = await flushQueue();

    setPending(result.remaining);

    if (result.sent > 0) {
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    // Se difiere al siguiente tick: la cola vive en IndexedDB (asíncrona) y así
    // no se encadena un render justo después del montaje.
    const initial = window.setTimeout(() => {
      void refresh();
    }, 0);

    const onOnline = () => {
      void sync();
    };
    const onOutbox = () => {
      void refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("signajob:outbox", onOutbox);
    document.addEventListener("visibilitychange", onVisible);

    const interval = window.setInterval(() => {
      void sync();
    }, 30000);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("signajob:outbox", onOutbox);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
      window.clearTimeout(initial);
    };
  }, [refresh, sync]);

  if (online && pending === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900"
    >
      <span>
        {online
          ? "Hay cambios guardados en el dispositivo"
          : "Sin conexión: los cambios se guardan en el dispositivo"}
      </span>

      <span className="flex items-center gap-2">
        {pending > 0 ? (
          <span className="rounded bg-amber-900 px-1.5 py-0.5 text-xs font-medium text-amber-50">
            {pending} {pending === 1 ? "pendiente" : "pendientes"}
          </span>
        ) : null}
        {online && pending > 0 ? (
          <button
            type="button"
            onClick={() => void sync()}
            className="rounded border border-amber-900 px-2 py-0.5 text-xs font-medium"
          >
            Reintentar
          </button>
        ) : null}
      </span>
    </div>
  );
}
