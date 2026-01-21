import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import Providers from "@/providers/Providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { DropdownProvider } from "@/contexts/DropdownContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Police Hero Titles - Impact Maximum
const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
});

// Police Section Titles - Élégance
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

// Police Body Text - Lisibilité (déjà installé)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

// Police technique/code
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Centre Médical VIDA | Ophtalmologie à Brazzaville, Congo",
  description: "Centre médical spécialisé en ophtalmologie à Brazzaville. Consultations, dépistages glaucome/cataracte, lunetterie. Prenez RDV en ligne. Équipe qualifiée, équipements modernes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sora.variable} ${plusJakartaSans.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <DropdownProvider>
            <NotificationProvider>
              <ToastProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </ToastProvider>
            </NotificationProvider>
          </DropdownProvider>
        </Providers>
      </body>
    </html>
  );
}
