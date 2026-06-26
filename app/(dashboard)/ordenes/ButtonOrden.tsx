//app/(dashboard)/ordenes/ButtonOrden.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link"; // Corregida la ruta de importación de Link
import { User, CreditCard, Ban, Package, House, Truck } from "lucide-react";
import BotonDetallePago from "./[id]/BotonDetallePago";
import BotonDetalleComprador from "./ButtonDetalleComprador";

export default function BotoneraOrden({ ordenActiva }: { ordenActiva: any }) {
  const { getToken } = useAuth();
  

  // Extraemos nuestro paquete específico de adentro de la orden
  const miPaquete = ordenActiva.paquetes[0];
  const esCancelado = miPaquete.status === "CANCELADO";
  const esPreparado = miPaquete.status === "PREPARADO";
  const esEntregado = miPaquete.status === "ENTREGADO";

 
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <BotonDetalleComprador 
        idBuyer={ordenActiva.id_buyer}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors w-full ${
          ordenActiva.id_buyer 
            ? "border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700" 
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500" 
        }`}
      >
        <User size={24} />
        <span className="font-semibold text-sm">Ver Comprador</span>
      </BotonDetalleComprador>

      <BotonDetallePago 
        idPaymentOperation={ordenActiva.id_payment_operation}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors w-full ${
          ordenActiva.id_payment_operation 
            ? "border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-700" 
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500" // Se pone grisáceo si falta el pago
        }`}      >
        <CreditCard size={24} /> 
        <span className="font-semibold text-sm">Detalles del Pago</span>
      </BotonDetallePago>

      <Link 
        href={`/ordenes/${ordenActiva.paquetes[0].id_package}`} 
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors text-center w-full ${
          esCancelado 
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" 
            : esPreparado
            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            : esEntregado
            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        <span className="text-xl">
          {esCancelado ? <Ban size={24} /> : esPreparado ? <Package size={24} /> : esEntregado ? <House size={24} /> : <Truck size={24} />}
        </span>
        <span className="font-semibold text-sm">Detalle del Paquete</span>
      </Link>
    </div>
  );
}