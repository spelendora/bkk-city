import type { Metadata } from "next";
import { Inter, Inter_Tight, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400"],
});

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["200", "300"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: "variable",
  axes: ["SOFT", "WONK"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bkk.city"),
  title: {
    default: "FAQ Bangkok",
    template: "%s — FAQ Bangkok",
  },
  description:
    "Архив знаний о Бангкоке — визы, жильё, транспорт. На основе @bkk_chat.",
};

// Runs before React hydration — prevents flash-of-wrong-theme.
const themeInit = `(function(){try{var t=localStorage.getItem('bkk-theme');if(!t){var dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;t=dark?'ink':'paper';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','paper');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-theme="paper"
      className={`${inter.variable} ${interTight.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
        {children}
      </body>
    </html>
  );
}
