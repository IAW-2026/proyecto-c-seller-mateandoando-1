import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs' 
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seller App - Mateando Ando",
  description: "Panel de gestión para vendedores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider> 
      <html lang="es">
        <body> 
          <Toaster richColors position="bottom-right" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}