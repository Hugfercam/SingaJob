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
  themeColor: "#14532d",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
