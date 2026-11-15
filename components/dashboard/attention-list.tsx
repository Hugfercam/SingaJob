import Link from "next/link";

import type { AttentionItem } from "@/lib/dashboard/queries";

const ICONS: Record<AttentionItem["kind"], string> = {
  unassigned: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  stalled: "M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  unsigned: "M4 18c4-5 8 3 12-2M6 6h12",
};

/**
 * Avisos accionables: cada uno lleva a la lista filtrada donde se resuelve.
 * Si no hay nada pendiente, no se muestra la sección.
 */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.kind}>
          <Link
            href={item.href}
            className="tap flex items-start gap-3 rounded-card border border-warn/25 bg-warn/5 px-4 py-3 transition-colors hover:bg-warn/10"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warn">
              <path
                d={ICONS[item.kind]}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="font-medium text-ink">{item.title}</span>
                <span className="tabular rounded bg-warn px-1.5 py-0.5 text-xs font-semibold text-white">
                  {item.count}
                </span>
              </span>
              <span className="text-sm text-ink-soft">{item.detail}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
