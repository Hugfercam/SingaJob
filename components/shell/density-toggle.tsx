"use client";

import { useSyncExternalStore } from "react";

const EVENT = "signajob:density";
const KEY = "signajob:density";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);

  return () => window.removeEventListener(EVENT, callback);
}

function isFieldMode() {
  return document.documentElement.dataset.density === "field";
}

/**
 * Cambia entre densidad de oficina y de obra.
 *
 * El modo se aplica con `data-density` en `<html>` (lo lee el CSS) y se guarda
 * en el dispositivo. No usa estado de React para leer del DOM: así no hay
 * desajuste al hidratar.
 */
export function DensityToggle() {
  const field = useSyncExternalStore(subscribe, isFieldMode, () => false);

  function toggle() {
    const next = !field;
    document.documentElement.dataset.density = next ? "field" : "office";

    try {
      localStorage.setItem(KEY, next ? "field" : "office");
    } catch {
      // Sin almacenamiento, el modo dura lo que dure la sesión.
    }

    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={field}
      className="tap inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-soft/50"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        {field ? (
          <path
            d="M4 7h16M4 12h10M4 17h7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M4 12c3-4 6 4 9 0s5 3 7-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
      {field ? "Modo oficina" : "Modo obra"}
    </button>
  );
}
