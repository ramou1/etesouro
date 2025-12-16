import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "eTE$OURO - Controle Financeiro",
  description: "A solução completa para gerenciar receitas, despesas e evitar endividamento. Ideal para indivíduos, famílias e grupos.",
  openGraph: {
    title: "eTE$OURO - Controle Financeiro",
    description: "A solução completa para gerenciar receitas, despesas e evitar endividamento. Ideal para indivíduos, famílias e grupos.",
    url: "https://etesouro.com.br",
    siteName: "eTE$OURO",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "eTE$OURO - Controle Financeiro",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "eTE$OURO - Controle Financeiro",
    description: "A solução completa para gerenciar receitas, despesas e evitar endividamento.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${instrumentSans.variable} font-sans antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
