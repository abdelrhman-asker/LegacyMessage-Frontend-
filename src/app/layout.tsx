import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import GlobalNavbar from "@/components/GlobalNavbar";
import ScrollReveal from "@/components/ScrollReveal";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Lastdot",
  description: "Preserve words that matter, for the moments that matter most.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ScrollReveal />
          <GlobalNavbar />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
