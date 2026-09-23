import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const garet = localFont({
  src: [
    { path: "../fonts/Garet-Book.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Garet-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-garet",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IBROS · Cotizá tu iPhone",
  description:
    "Cotizador de recompra de iPhones usados de IBROS. Elegí tu modelo, respondé sobre su estado y recibí un valor estimado al instante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${garet.variable} ${montserrat.variable} ${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
