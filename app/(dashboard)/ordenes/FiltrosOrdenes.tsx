"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useTransition } from "react";

export default function FiltrosOrdenes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Función para manejar la búsqueda por texto
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    // startTransition hace que la UI no se congele mientras Next.js busca los datos
    startTransition(() => {
      router.replace(`/ordenes?${params.toString()}`);
    });
  };

  // Función para manejar el filtro por estado
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("filtro", status);
    } else {
      params.delete("filtro");
    }
    startTransition(() => {
      router.replace(`/ordenes?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
      
      {/* Barra de Búsqueda */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por ID de orden o producto..."
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 outline-none transition-all text-sm"
        />
      </div>

      {/* Selector de Estado */}
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter size={18} className="text-slate-400" />
        </div>
        <select
          defaultValue={searchParams.get("filtro")?.toString() || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 outline-none transition-all text-sm appearance-none cursor-pointer"
        >
          <option value="">Todas las órdenes</option>
          <option value="PREPARADO">Para Despachar (Preparado)</option>
          <option value="RETIRADO">En Camino (Retiradas)</option>
          <option value="ENTREGADO">Entregadas</option>
          <option value="CANCELADO">Canceladas</option>
        </select>
      </div>
      
      {/* Mini indicador de carga */}
      {isPending && (
        <div className="flex items-center justify-center px-2">
          <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}