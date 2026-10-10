import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { Preloader } from "@/components/layout/Preloader";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["wdth"],
  adjustFontFallback: true,
  variable: "--font-instrument",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="relative flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("motion")}}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("preloader-seen")==="1"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.preloader="seen"}}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        {children}
        <Preloader />
      </body>
    </html>
  );
}
