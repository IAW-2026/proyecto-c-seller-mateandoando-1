//app/(dashboard)/dashboard/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Productos", href: "/productos" },
  { name: "Órdenes", href: "/ordenes" },
  { name: "Añadir Producto", href: "/nuevo" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Armamos una funcioncita para no escribir los botones dos veces
  const NavLinks = ({ esCelular }: { esCelular?: boolean }) => (
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {MENU_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            // Si es celular, al hacer clic cerramos el menú
            onClick={() => esCelular && setIsOpen(false)}
            className={`block px-4 py-3 rounded transition-colors text-sm font-medium ${
              isActive
                ? "bg-[#e2f4c8] text-[#1B4332] border border-[#d7e9bd]"
                : "text-[#414844] hover:bg-[#F9F7F2]"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* =========================================================
          VERSIÓN 1: COMPUTADORA (PC)
          Siempre visible a la izquierda. Oculto en celulares.
      ========================================================= */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-[#E5E2D9] sticky top-0 shrink-0">
        <div className="p-6 h-20 flex items-center border-b border-[#E5E2D9]">
          <h2 className="text-xl font-bold tracking-tight text-[#1B4332]">Panel Seller</h2>
        </div>
        
        <NavLinks />
        
        <div className="p-4 border-t border-[#E5E2D9]">
          <SignOutButton>
            <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors">
              Cerrar Sesión
            </button>
          </SignOutButton>
        </div>
      </aside>


      {/* =========================================================
          VERSIÓN 2: CELULAR (MÓVIL)
          Barra superior fija. Oculto en PC.
      ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 flex items-center px-4 gap-4 z-40">
  
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-gray-100 text-[#1B4332] rounded-md focus:outline-none"
        >
          {/* Ícono de Hamburguesa */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
      </div>

      {/* Menú Desplegable que sale al tocar la hamburguesa */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Fondo oscuro translúcido */}
          <div 
            className="fixed inset-0 bg-black/60" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cajón blanco del menú */}
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl">
            <div className="p-4 h-16 flex items-center justify-between border-b border-[#E5E2D9]">
              <h2 className="text-xl font-bold text-[#1B4332] font-manrope">Menú</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
              >
                {/* Ícono de X para cerrar */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <NavLinks esCelular={true} />
            
            <div className="p-4 border-t border-[#E5E2D9]">
              <SignOutButton>
                <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors">
                  Cerrar Sesión
                </button>
              </SignOutButton>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}