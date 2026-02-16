import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { InsforgeProvider } from './providers';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zoe Convert',
  description: 'Conversión Inteligente de Imágenes a WebP — optimiza tus imágenes automáticamente con calidad profesional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${figtree.variable} antialiased font-sans`}>
        <InsforgeProvider>
          {children}
          <Toaster />
        </InsforgeProvider>
      </body>
    </html>
  );
}
