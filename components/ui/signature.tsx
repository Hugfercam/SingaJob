/**
 * Trazo de firma: el recurso gráfico propio de SignaJob.
 *
 * Se usa como subrayado de sección, como indicador de progreso y como sello al
 * cerrar un parte. Es el mismo gesto que vende el producto.
 */
export function SignatureRule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 12"
      aria-hidden="true"
      focusable="false"
      className={`h-2.5 w-32 text-brand ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M2 8.5C34 2.5 58 11 92 6.5s64-3.5 88 1.5 36-1 58-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Sello que aparece cuando un parte queda cerrado. */
export function SignatureSeal({ label }: { label: string }) {
  return (
    <div className="relative inline-flex size-24 items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full text-brand/30"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full text-brand"
      >
        <path
          d="M18 58c14-6 24 6 34-2s18-14 30-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="signature-draw"
        />
      </svg>
      <span className="mt-6 text-center text-[10px] leading-tight font-semibold tracking-wide text-brand uppercase">
        {label}
      </span>
    </div>
  );
}
