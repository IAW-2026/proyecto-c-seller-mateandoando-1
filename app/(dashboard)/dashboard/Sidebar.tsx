"use client"; //Necesario para usar hooks del navegador como usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

// Definimos las rutas en un arreglo
const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Productos", href: "/productos" },
  { name: "Órdenes", href: "/ordenes" },
  { name: "Añadir Producto", href: "/nuevo" },
];

export default function Sidebar() {
  const pathname = usePathname(); // Obtenemos la URL actual exacta

  return (
    <aside className="w-64 bg-white border-r border-[#E5E2D9] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#E5E2D9]">
        <h2 className="text-xl font-bold text-[#1B4332] font-manrope">Panel Seller</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          // Lógica de sombreado
          // Comparamos si la URL actual coincide con el link del botón
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`block px-4 py-3 rounded transition-colors text-sm font-medium ${
                isActive 
                  ? "bg-[#e2f4c8] text-[#1B4332] border border-[#d7e9bd]" // Estilo Sombreado (Activo)
                  : "text-[#414844] hover:bg-[#F9F7F2]"                   // Estilo Inactivo
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E5E2D9]">
        <SignOutButton>
          <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors">
            Cerrar Sesión
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}