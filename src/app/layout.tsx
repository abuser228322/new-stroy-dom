import type { Metadata } from "next";
import { Viewport } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HammerCursor from "./components/HammerCursor";

// Viewport configuration для мобильных браузеров
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0EA5E9",
};

// Default metadata для корневого layout - используется как fallback
export const metadata: Metadata = {
  title: "Строй Дом - Магазин строительных материалов в Астрахани",
  description:
    "Строительные материалы в Астрахани: профнастил, сухие смеси, гипсокартон, утеплители, крепёж и инструменты. Низкие цены, доставка по городу.",
  metadataBase: new URL("https://stroydom30.ru"),
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Строй Дом - Магазин строительных материалов в Астрахани",
    description:
      "Строительные материалы в Астрахани: профнастил, сухие смеси, гипсокартон, утеплители, крепёж и инструменты. Низкие цены, доставка по городу.",
    url: "https://stroydom30.ru",
    type: "website",
    images: [
      {
        url: "https://stroydom30.ru/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Строй Дом - Магазин строительных материалов",
      },
    ],
    siteName: "Строй Дом",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Строй Дом - Магазин строительных материалов в Астрахани",
    description:
      "Строительные материалы в Астрахани: профнастил, сухие смеси, гипсокартон, утеплители, крепёж и инструменты.",
    images: ["https://stroydom30.ru/og-image.jpg"],
  },
  other: {
    "theme-color": "#0EA5E9",
    "msapplication-TileColor": "#0EA5E9",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Favicon ссылки управляются через metadata API */}
      </head>
      <body className="min-w-[360px] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
        <AuthProvider>
          <CartProvider>
            <HammerCursor />
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
