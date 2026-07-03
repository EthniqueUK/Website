import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ethnique — Wear · Celebrate · Share",
  description:
    "Ethnique is a celebration of timeless tradition and contemporary style. Discover Indian ethnic and traditional wear crafted to be worn, shared, and cherished.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#F7F3EB] text-[#1F1F1F] antialiased">
        {children}
      </body>
    </html>
  );
}
