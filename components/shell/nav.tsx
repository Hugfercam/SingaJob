"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: "home" | "clip" | "users" | "more" };

const ICONS: Record<Item["icon"], string> = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9h5v-5h3v5h5v-9",
  clip: "M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2Z",
  users: "M4 19c0-3 3.5-4.5 5-4.5S14 16 14 19M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 0a3 3 0 1 0 0-6m-1 14c0-2 1.5-3.5 3-4s3 1 3 4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

/**
 * Navegación principal: barra inferior en móvil y lateral en escritorio.
 * El mismo componente, dos presentaciones.
 */
export function Nav({ items }: { items: Item[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/panel" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-3xl">
          {items.map((item) => {
            const active = isActive(item.href);

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`tap flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                    active ? "text-brand" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
                    <path
                      d={ICONS[item.icon]}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={active ? 2.1 : 1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Principal"
        className="sticky top-24 hidden h-fit w-48 shrink-0 flex-col gap-1 lg:flex"
      >
        {items.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`tap flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-soft text-brand"
                  : "text-ink-soft hover:bg-brand-soft/40 hover:text-ink"
              }`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
                <path
                  d={ICONS[item.icon]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.1 : 1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export type NavItem = Item;
