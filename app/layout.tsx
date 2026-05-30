import type { Metadata } from "next";
import { Inter } from "next/font/google";
// 1. VOLVEMOS A IMPORTAR CLERK
import { ClerkProvider } from '@clerk/nextjs' 
import "./globals.css";

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
    // 2. ENVOLVEMOS TODO CON EL PROVIDER DE CLERK
    <ClerkProvider> 
      <html lang="es">
        <body className={`${inter.className} antialiased text-slate-800 bg-[#F9F7F2]`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}