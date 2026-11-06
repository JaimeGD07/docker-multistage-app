import type { Metadata } from "next";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart/cart-provider";

export const metadata: Metadata = {
  title: {
    default: "Kodigo Tech | Hardware y periféricos",
    template: "%s | Kodigo Tech",
  },
  description:
    "Tienda de hardware y periféricos construida con Next.js 16 sobre una API Laravel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-amber focus:px-3 focus:py-2 focus:text-amber-ink"
        >
          Saltar al contenido
        </a>
        <CartProvider>
          <SiteHeader />
          <div id="contenido" className="flex-1">
            {children}
          </div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
