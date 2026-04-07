import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import NavbarWithCart from "./components/NavbarWithCart";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Archery Kenya — Track. Train. Triumph.",
  description:
    "Kenya's archery performance tracking app. Log scores, track equipment, analyse performance, and stay connected with the archery community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Archery KE",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#006B3F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ServiceWorkerRegistration />
        <AuthProvider>
          <CartProvider>
            <NavbarWithCart />
            <div className="ke-stripe" />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
