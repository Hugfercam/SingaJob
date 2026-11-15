import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "SignaJob",
  title: {
    default: "SignaJob — Partes de trabajo con firma del cliente",
    template: "%s · SignaJob",
  },
  description:
    "Partes de trabajo, albaranes con firma del cliente y registro de jornada para pequeñas empresas de reforma, instalaciones y mantenimiento.",
  appleWebApp: {
    capable: true,
    title: "SignaJob",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#002c69",
  colorScheme: "light",
};

/**
 * El modo obra se aplica antes de pintar, leyendo la preferencia guardada.
 * Sin esto, la pantalla aparecería en modo oficina y saltaría al cargar.
 */
const densityScript = `
try {
  var mode = localStorage.getItem("signajob:density");
  if (mode === "field") document.documentElement.dataset.density = "field";
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: densityScript }} />
      </head>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
