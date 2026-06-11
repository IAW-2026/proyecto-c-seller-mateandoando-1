//app/(dashboard)/ordenes/GridOrdenesPaginado.tsx
"use client";

import { useState } from "react";
import { ShoppingBag, Truck, Package, ChevronLeft, ChevronRight, House, Ban } from "lucide-react";
import { EstadoPaquete } from "@prisma/client"; 
import ButtonOrden from "./ButtonOrden";

export default function GridOrdenesPaginado({ misOrdenes }: { misOrdenes: any[] }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 4; // Mostramos 4 tarjetas por página (2x2)

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const ordenesParaMostrar = misOrdenes.slice(indicePrimerItem, indiceUltimoItem);

  const totalPaginas = Math.ceil(misOrdenes.length / itemsPorPagina);

  if (misOrdenes.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm mt-6">
        <span className="text-4xl block mb-3 flex justify-center"><ShoppingBag size={40} className="text-slate-300" /></span>
        <p className="text-slate-500 font-medium text-lg">No hay órdenes en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      
      {/* 1. LA GRILLA DE TARJETAS (Acá está la magia) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {ordenesParaMostrar.map((orden) => {
          const paquete = orden.paquetes[0];
          const retirado = paquete.status === EstadoPaquete.RETIRADO 
          const entregado = paquete.status === EstadoPaquete.ENTREGADO;
          const cancelado = paquete.status === EstadoPaquete.CANCELADO;

          return (
            <div key={orden.id_purchase_order} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
              
              {/* Cabecera de la tarjeta: Info y Estado */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${entregado ? "bg-green-50 text-green-600" : retirado ? "bg-emerald-50 text-emerald-700" : cancelado ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-500"}`}>
                    {retirado ? <Truck size={20} /> : entregado ? <House size={20} /> : cancelado ? <Ban size={20} /> : <Package size={20} /> }
                  </div>
                  <div>
                    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md mb-1 tracking-wide">
                      ORDEN #{orden.id_purchase_order.slice(-6).toUpperCase()}
                    </span>
                    <p className="font-bold text-slate-900 text-lg">
                      ${Number(orden.total_price).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide 
                  ${paquete.status === EstadoPaquete.ENTREGADO ? "bg-green-50 text-green-700 border border-green-200" 
                  : paquete.status === EstadoPaquete.CANCELADO ? "bg-red-50 text-red-700 border border-red-200"
                  : paquete.status === EstadoPaquete.RETIRADO ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-500 border border-blue-200"
                }`}>
                  {paquete.status}
                </span>
              </div>

              {/* Botonera en la base de la tarjeta */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <ButtonOrden ordenActiva={orden} />
              </div>

            </div>
          );
        })}
      </div>

      {/* 2. CONTROLES DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 shadow-sm mt-2">
          <p className="text-sm text-slate-500">
            Página <span className="font-bold text-slate-700">{paginaActual}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-gray-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-gray-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}