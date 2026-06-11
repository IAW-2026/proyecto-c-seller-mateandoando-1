"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Truck, Package, ChevronLeft, ChevronRight, House, Ban } from "lucide-react";
import { EstadoPaquete } from "@prisma/client"; // Ajustá el import según tu proyecto

export default function ListaOrdenesPaginada({ misOrdenes }: { misOrdenes: any[] }) {
  // 1. Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 4; // Podés cambiar este número al que prefieras

  // 2. Matemática para "cortar" el array de órdenes
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  // A la pantalla solo le pasamos el pedacito del array que corresponde a esta página
  const ordenesParaMostrar = misOrdenes.slice(indicePrimerItem, indiceUltimoItem);

  const totalPaginas = Math.ceil(misOrdenes.length / itemsPorPagina);

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">
        Historial de Órdenes Recientes
      </h3>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {misOrdenes.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl block mb-3 flex justify-center"><ShoppingBag size={32} className="text-slate-300" /></span>
            <p className="text-slate-500 font-medium">Aún no hay ventas registradas.</p>
            <p className="text-sm text-slate-400 mt-1">Cuando los clientes compren en la Buyer App, aparecerán acá.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {/* ATENCIÓN: Ahora mapeamos 'ordenesParaMostrar' en lugar de 'misOrdenes' */}
              {ordenesParaMostrar.map((orden) => {
                const retirado = orden.paquetes[0].status === EstadoPaquete.RETIRADO;
                const entregado = orden.paquetes[0].status === EstadoPaquete.ENTREGADO;
                const cancelado = orden.paquetes[0].status === EstadoPaquete.CANCELADO;
                return (
                  <div key={orden.id_purchase_order} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${entregado ? "bg-green-100 text-green-700" : retirado ? "bg-emerald-100 text-emerald-700" : cancelado ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {retirado ? <Truck size={20} /> : entregado ? <House size={20} /> : cancelado ? <Ban size={20} /> : <Package size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Orden #{orden.id_purchase_order.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-slate-500">
                          Total: ${Number(orden.total_price).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                        ${orden.paquetes[0].status === EstadoPaquete.ENTREGADO
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : orden.paquetes[0].status === EstadoPaquete.CANCELADO
                            ? "bg-red-50 text-red-700 border-red-200"
                            : orden.paquetes[0].status === EstadoPaquete.RETIRADO
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                        {orden.paquetes[0].status}
                      </span>
                      <Link href={`/ordenes/${orden.paquetes[0].id_package}`} className="text-slate-400 hover:text-[#1B4332] transition-colors p-2 font-bold text-sm">
                        Ver detalle →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Controles de Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-slate-50">
                <p className="text-sm text-slate-500">
                  Mostrando página <span className="font-bold text-slate-700">{paginaActual}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}