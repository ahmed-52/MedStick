import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/cn";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

// One-shot purge of the broken `apis` cache from earlier builds (which
// runtime-cached /api/* with NetworkFirst and made newly-created chats
// invisible). The new SW uses NetworkOnly for /api/* so this only needs to
// run once per browser; the localStorage flag prevents repeat runs.
const PURGE_OLD_APIS_CACHE = `
(function(){
  try {
    if (localStorage.getItem('medstick:apis-cache-purged')) return;
    if (typeof caches !== 'undefined') {
      caches.keys().then(function(ks){
        return Promise.all(ks.filter(function(k){ return k === 'apis'; }).map(function(k){ return caches.delete(k); }));
      }).then(function(){ localStorage.setItem('medstick:apis-cache-purged','1'); }).catch(function(){});
    }
  } catch(_) {}
})();
`;

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MedStick",
  description: "Offline-first AI clinical workspace",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedStick",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "antialiased")}>
        <Script id="purge-old-apis-cache" strategy="beforeInteractive">{PURGE_OLD_APIS_CACHE}</Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
