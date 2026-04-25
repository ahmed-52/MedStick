import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/cn";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

// Kill any service worker a previous prod build left in the browser. The
// next-pwa SW from earlier builds runtime-cached /api/* GETs with NetworkFirst,
// which made newly created chats silently invisible to the sidebar (it served
// a stale 24-hour cached chat list). This kill switch unregisters any active
// SW and wipes its caches on every page load. Safe to keep around — it only
// runs if a SW is present.
const KILL_SW = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(rs => rs.forEach(r => r.unregister()))
    .catch(() => {});
  if (typeof caches !== 'undefined') {
    caches.keys()
      .then(ks => Promise.all(ks.map(k => caches.delete(k))))
      .catch(() => {});
  }
}
`;

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MedStick",
  description: "Offline-first AI clinical workspace",
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
        <Script id="kill-sw" strategy="beforeInteractive">{KILL_SW}</Script>
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
