import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ---------- Botones ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-paper hover:bg-brand/90 active:bg-brand/95 shadow-sm",
  secondary:
    "bg-surface text-ink border border-line hover:bg-brand-soft/50 active:bg-brand-soft/70",
  ghost: "text-brand hover:bg-brand-soft/60",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-base rounded-xl",
  lg: "px-5 py-3 text-lg rounded-xl",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return [
    "tap inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

/* ---------- Superficies ---------- */

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  return (
    <Tag
      className={`rounded-card border border-line bg-surface ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ---------- Estados ---------- */

export type Tone = "neutral" | "active" | "done" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-line/60 text-ink-soft",
  active: "bg-brand-soft text-brand",
  done: "bg-brand text-paper",
  danger: "bg-danger/10 text-danger",
};

/**
 * Estado con texto **y** color: nunca solo color. Sirve para daltonismo y para
 * leer a pleno sol.
 */
export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Cifras ---------- */

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  const styles: Record<Tone, string> = {
    neutral: "border-line bg-surface",
    active: "border-brand/25 bg-brand-soft/70",
    done: "border-brand/20 bg-brand-soft/40",
    danger: "border-danger/25 bg-danger/5",
  };

  const valueColor = tone === "active" ? "text-brand" : "text-ink";

  return (
    <div
      className={`flex flex-col gap-1 rounded-card border px-3.5 py-3 ${styles[tone]}`}
    >
      <span className="text-[11px] leading-tight font-semibold tracking-wider text-ink-soft uppercase">
        {label}
      </span>
      <span className={`tabular text-3xl leading-none font-semibold ${valueColor}`}>
        {value}
      </span>
      {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
    </div>
  );
}

/* ---------- Títulos de sección ---------- */

/**
 * Título de sección, sin adornos.
 *
 * Aquí hubo un subrayado con el trazo de firma: repetido bajo cada cabecera se
 * convirtió en decoración que no informa. El trazo queda para donde significa
 * algo (progreso de un parte y sello al firmarlo).
 */
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="font-display text-xl leading-tight font-semibold text-ink">
        {children}
      </h2>
      {action}
    </div>
  );
}

/* ---------- Vacíos ---------- */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-4 py-8 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? (
        <p className="max-w-xs text-sm text-ink-soft">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

/* ---------- Campos ---------- */

export const controlClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand disabled:bg-line/40 disabled:text-ink-soft";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
