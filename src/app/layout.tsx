import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import NavbarWithCart from "./components/NavbarWithCart";

export const metadata: Metadata = {
  title: "Archery Kenya — Track. Train. Triumph.",
  description: "Kenya's archery performance tracking platform. Log sessions, connect with coaches, shop gear, and stay updated on national competitions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
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
