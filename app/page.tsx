import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buttonClass, Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "SignaJob — El parte que el cliente firma en el momento",
  description:
    "Partes de trabajo con fotos, ubicación y la firma del cliente. El albarán en PDF al instante, con o sin cobertura. Para empresas de reformas, instalaciones y mantenimiento.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://signajob.com",
    siteName: "SignaJob",
    title: "SignaJob — El parte que el cliente firma en el momento",
    description:
      "Cierra el parte en obra: fotos, ubicación y firma del cliente. Albarán en PDF al instante. Funciona sin cobertura.",
  },
};

/**
 * Landing pública.
 *
 * Es una página estática a propósito: no consulta la sesión para poder servirse
 * desde caché y pintarse antes. La entrada está en el botón secundario y en el
 * pie.
 *
 * Sin JavaScript de cliente: el movimiento es CSS (respeta
 * `prefers-reduced-motion`) y el contenido funciona sin hidratar.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <section className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* Panel de marca */}
        <div className="relative overflow-hidden bg-brand px-6 pt-8 pb-14 text-paper lg:px-14 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(2,159,145,0.35),transparent_65%)]"
          />

          <header className="relative flex items-center justify-between">
            <p className="flex items-center gap-2">
              <Image
                src="/brand/mark-light.png"
                alt=""
                width={36}
                height={36}
                priority
                className="size-9"
              />
              <span className="font-display text-xl font-semibold">SignaJob</span>
            </p>
            <span className="rounded-full border border-paper/25 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
              Beta abierta
            </span>
          </header>

          <div className="relative mt-12 flex flex-col gap-5 lg:mt-16">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Partes con firma
            </p>

            <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              El parte que el cliente firma{" "}
              <em className="text-accent">en el momento.</em>
            </h1>

            <p className="max-w-md text-pretty text-paper/80">
              Fotos, ubicación y firma en el móvil del técnico. El albarán en PDF
              sale solo, con o sin cobertura. Sin papel, sin WhatsApp y sin
              discusiones al cobrar.
            </p>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/70">
              <li className="flex items-center gap-2">
                <Dot /> Firma del cliente
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Funciona sin cobertura
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Se instala en el móvil
              </li>
            </ul>
          </div>

          {/* El albarán, que es el producto */}
          <div className="relative mt-12 lg:mt-16">
            <div className="mx-auto w-full max-w-sm rotate-[-1.2deg] rounded-xl bg-surface p-5 text-ink shadow-2xl shadow-black/30">
              <div className="flex items-start justify-between border-b-2 border-brand pb-2">
                <div>
                  <p className="font-display text-sm font-semibold text-brand">
                    Reformas Peña S.L.
                  </p>
                  <p className="text-[10px] text-ink-soft">
                    CIF B12345678 · Valencia
                  </p>
                </div>
                <p className="text-right text-[10px] font-semibold tracking-wide uppercase">
                  Albarán
                  <span className="block font-normal text-ink-soft normal-case">
                    15/11/2026
                  </span>
                </p>
              </div>

              <dl className="mt-3 flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Cliente</dt>
                  <dd>Eva María Flor Lozano</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Trabajo</dt>
                  <dd>Reforma de cocina</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Técnico</dt>
                  <dd>Nuria Peña</dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Cliente", "Técnico"].map((role) => (
                  <div key={role}>
                    <svg
                      viewBox="0 0 120 40"
                      role="img"
                      aria-label={`Firma de ${role.toLowerCase()}`}
                      className="h-8 w-full text-brand"
                    >
                      <path
                        d="M4 28c14-16 20 6 30-4s12 12 22 2 14-14 26-6 10 10 20 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="signature-draw"
                      />
                    </svg>
                    <p className="border-t border-line pt-1 text-[10px] text-ink-soft">
                      {role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-paper/60">
              Albarán real generado por SignaJob
            </p>
          </div>
        </div>

        {/* Panel de acción */}
        <div className="flex flex-col justify-center gap-6 px-6 py-14 lg:px-14">
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-brand" />
              Empieza ahora
            </p>
            <h2 className="font-display text-4xl leading-tight font-semibold text-ink">
              Cierra el parte{" "}
              <em className="text-accent">antes de salir de la obra.</em>
            </h2>
            <p className="text-pretty text-ink-soft">
              Estamos en beta: se usa gratis mientras lo pulimos con las primeras
              empresas. Sin tarjeta y sin permanencia.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/registro"
              className={buttonClass({ size: "lg", className: "w-full" })}
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className={buttonClass({
                variant: "secondary",
                size: "lg",
                className: "w-full",
              })}
            >
              Ya tengo cuenta · Entrar
            </Link>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <Check /> Sin instalar nada: abre el enlace en el móvil y añádelo a
              la pantalla de inicio.
            </li>
            <li className="flex items-start gap-2">
              <Check /> El técnico trabaja aunque no haya cobertura.
            </li>
            <li className="flex items-start gap-2">
              <Check /> Tus datos son de tu empresa: nadie de fuera los ve.
            </li>
          </ul>
        </div>
      </section>

      {/* Problema */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16">
        <h2 className="max-w-2xl font-display text-3xl leading-tight font-semibold text-ink text-balance">
          El parte en papel se pierde. El del WhatsApp no se puede cobrar.
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              t: "Fotos que no llegan",
              d: "El técnico las manda por WhatsApp y acaban en un grupo que nadie encuentra tres meses después.",
            },
            {
              t: "Sin firma, sin prueba",
              d: "El cliente dice que no autorizó ese extra. Sin firma, la discusión la ganas tú solo de palabra.",
            },
            {
              t: "Albaranes a mano",
              d: "Se rellenan al volver a la oficina, de memoria, y se pierden horas y detalles.",
            },
          ].map((item) => (
            <Card key={item.t} className="flex flex-col gap-1.5 px-5 py-5">
              <p className="font-medium text-ink">{item.t}</p>
              <p className="text-sm text-ink-soft">{item.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
          <h2 className="font-display text-3xl leading-tight font-semibold text-ink">
            Tres pasos, en la misma obra
          </h2>

          <ol className="grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Creas el parte",
                d: "Desde la oficina o el móvil, con el cliente y la obra. Plantillas para no escribir dos veces lo mismo.",
              },
              {
                n: "2",
                t: "El técnico lo rellena",
                d: "Fotos, campos y ubicación desde el sitio. Si no hay cobertura, se guarda en el móvil y sube después.",
              },
              {
                n: "3",
                t: "El cliente firma",
                d: "Firma en pantalla y el albarán se genera con las firmas, las fotos y el GPS. Se descarga o se comparte.",
              },
            ].map((step) => (
              <li key={step.n} className="flex flex-col gap-2">
                <span className="tabular flex size-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-paper">
                  {step.n}
                </span>
                <p className="font-medium text-ink">{step.t}</p>
                <p className="text-sm text-ink-soft">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* La firma */}
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-brand" />
            La firma
          </p>
          <h2 className="font-display text-3xl leading-tight font-semibold text-ink text-balance">
            Una firma con nombre, fecha y GPS no se discute.
          </h2>
          <p className="text-pretty text-ink-soft">
            El cliente firma en el móvil del técnico y el documento queda cerrado
            con quién firmó, cuándo y dónde. Es la diferencia entre «ya te lo
            mando» y un albarán que se puede enseñar.
          </p>
        </div>

        <Card className="flex flex-col gap-4 px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            {["Eva María Flor Lozano", "Nuria Peña"].map((name, index) => (
              <div key={name}>
                <svg viewBox="0 0 120 40" aria-hidden="true" className="h-10 w-full text-brand">
                  <path
                    d={
                      index === 0
                        ? "M4 28c14-16 20 6 30-4s12 12 22 2 14-14 26-6 10 10 20 2"
                        : "M6 26c10-12 18 8 28-2s16 10 26 0 16-10 24-2"
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="signature-draw"
                  />
                </svg>
                <p className="border-t border-line pt-1 text-xs text-ink">{name}</p>
                <p className="text-[11px] text-ink-soft">
                  {index === 0 ? "Cliente" : "Técnico"} · 15/11/2026
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-soft">
            Inicio y fin con coordenadas, fotos del trabajo y el PDF listo para
            enviar o imprimir.
          </p>
        </Card>
      </section>

      {/* Sin cobertura */}
      <section className="bg-brand text-paper">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Sin cobertura
            </p>
            <h2 className="font-display text-3xl leading-tight font-semibold text-balance">
              En un sótano, en un pueblo o con el móvil sin datos.
            </h2>
            <p className="max-w-md text-pretty text-paper/80">
              Los cambios se guardan en el dispositivo y suben solos al recuperar
              la conexión. Nada se pierde y nadie tiene que repetir el trabajo.
            </p>
            <p className="text-sm text-paper/60">
              Además, el modo obra agranda la letra y los botones para trabajar
              con guantes o al sol.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#FFFBEB] px-4 py-2.5 text-sm text-[#9A3412]">
              <span>Sin conexión: los cambios se guardan en el dispositivo</span>
              <span className="rounded bg-[#9A3412] px-1.5 py-0.5 text-xs font-semibold text-white">
                2 pendientes
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-paper px-4 py-3 text-ink">
              <span className="text-sm">Parte de cocina · Eva María Flor</span>
              <span className="rounded bg-brand px-2 py-0.5 text-xs font-semibold text-paper">
                Completado
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-paper/90 px-4 py-3 text-ink">
              <span className="text-sm">Revisión de cuadro · Comunidad</span>
              <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-brand">
                En curso
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Es para ti si…
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            {[
              "Tienes entre 3 y 20 personas y los partes los hacéis a mano.",
              "Trabajas en reformas, instalaciones o mantenimiento.",
              "Quieres cobrar sin discutir lo que se autorizó.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">
            No es para ti si…
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            {[
              "Buscas un ERP completo con facturación y contabilidad.",
              "Necesitas gestión de almacén o de flota.",
              "Quieres una app nativa: esto se instala desde el navegador.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-soft/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Preguntas */}
      <section className="border-t border-line">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Preguntas frecuentes
          </h2>

          {[
            {
              q: "¿Y si el cliente no está en la obra?",
              a: "El parte queda completado sin su firma y se ve en el panel como «completado sin firma». Puedes firmarlo cuando vuelvas o dejarlo así, marcado.",
            },
            {
              q: "¿Cuánto cuesta?",
              a: "Estamos en beta: ahora mismo se usa gratis mientras lo pulimos con las primeras empresas. Cuando haya precio lo diremos antes de cobrar nada.",
            },
            {
              q: "¿Mis datos y los de mis clientes están seguros?",
              a: "Cada empresa ve solo lo suyo: los datos están aislados por empresa y las fotos y firmas solo se sirven con sesión iniciada.",
            },
            {
              q: "¿Hace falta instalar algo?",
              a: "No. Se abre en el navegador del móvil y se puede añadir a la pantalla de inicio como una app. Ocupa poco y funciona sin cobertura.",
            },
            {
              q: "¿Puedo sacar los albaranes?",
              a: "Sí, cada parte completado genera un PDF con las firmas, las fotos y el GPS, listo para descargar o compartir.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-card border border-line bg-surface px-4 py-3"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-ink">
                {item.q}
                <span
                  aria-hidden="true"
                  className="text-ink-soft transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pt-2 text-sm text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="bg-brand text-paper">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="font-display text-3xl leading-tight font-semibold text-balance">
            Prueba el próximo parte con firma{" "}
            <em className="text-accent">de verdad.</em>
          </h2>
          <p className="max-w-md text-paper/75">
            Creas la cuenta en un minuto. Estamos en beta y se agradece el
            feedback más que el aplauso.
          </p>
          <Link href="/registro" className={buttonClass({ size: "lg" })}>
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3">
            <Image
              src="/brand/mark.png"
              alt="SignaJob"
              width={32}
              height={32}
              className="size-8"
            />
            <span>SignaJob · signajob.com · Partes de trabajo con firma del cliente.</span>
          </p>
          <p className="flex flex-wrap gap-4">
            <Link href="/login" className="underline underline-offset-4">
              Entrar
            </Link>
            <Link href="/registro" className="underline underline-offset-4">
              Crear cuenta
            </Link>
            <span>Aviso legal y privacidad: en preparación</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="size-1.5 rounded-full bg-accent"
    />
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-accent"
    >
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
