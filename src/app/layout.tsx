import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Josi Corrêa Boutique — Gestão",
    template: "%s · Josi Corrêa Gestão",
  },
  description: "Sistema de gestão da Josi Corrêa Boutique",
  applicationName: "Josi Corrêa Gestão",
  appleWebApp: {
    capable: true,
    title: "Josi Corrêa",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#661F2D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
