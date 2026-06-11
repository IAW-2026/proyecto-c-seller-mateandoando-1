//app/(dashboard)/ordenes/ButtonOrden.tsx
//va a recibir la orden real que le mandó el servidor para hacer las consultas

"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/dist/client/link";
import {User, CreditCard, Ban, Package, House, Truck} from "lucide-react";

export default function BotoneraOrden({ ordenActiva }: { ordenActiva: any }) {
  const { getToken } = useAuth();
  
  const [cargandoBuyer, setCargandoBuyer] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [cargandoDespacho, setCargandoDespacho] = useState(false);

  // Extraemos nuestro paquete específico de adentro de la orden
  const miPaquete = ordenActiva.paquetes[0];
  const esCancelado = miPaquete.status === "CANCELADO";
  const esPreparado = miPaquete.status === "PREPARADO";
  const esEntregado = miPaquete.status === "ENTREGADO";

  const consultarComprador = async () => {
    setCargandoBuyer(true);
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BUYER_URL}/api/buyers/${ordenActiva.id_buyer}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Fallo al traer al comprador");
      const data = await response.json();
      alert(`Datos del comprador:\nNombre: ${data.first_name} ${data.last_name}\nTeléfono: ${data.phone}`);
    } catch (error) {
      alert("Error conectando con la Buyer App.");
    } finally {
      setCargandoBuyer(false);
    }
  };

  const consultarPago = async () => {
    setCargandoPago(true);
    try {
      // Si la Payments App todavía no asignó un ID de operación, avisamos
      if (!ordenActiva.id_payment_operation) {
        alert("El comprador todavía no inició el proceso de pago.");
        return;
      }

      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENTS_URL}/api/payments/transactions/${ordenActiva.id_payment_operation}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Fallo al consultar pago");
      const data = await response.json();
      alert(`Estado del pago: ${data.status}\nFecha: ${data.created_at}`);
    } catch (error) {
      alert("Error conectando con la Payments App.");
    } finally {
      setCargandoPago(false);
    }
  };

const despacharPaquete = async () => {
    setCargandoDespacho(true);
    try {
      const token = await getToken();
      
      // Le avisamos a Shipping App
      // Solo le pegamos a nuestra propia API interna
      const responseShipping = await fetch(`/api/packages/${miPaquete.id_package}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(miPaquete) // O el objeto que tenga los datos
      });

      if (!responseShipping.ok) throw new Error("Fallo al despachar en Shipping");
      
      const dataShipping = await responseShipping.json();
      const trackingCode = dataShipping.id_shipments; 

      // Le avisamos a NUESTRA propia base de datos
      const responseLocal = await fetch(`/api/packages/${miPaquete.id_package}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DESPACHADO",
          id_shipments: trackingCode 
        })
      });

      if (!responseLocal.ok) throw new Error("Fallo al guardar en nuestra base de datos");

      alert(`¡Éxito! Paquete despachado. Seguimiento: ${trackingCode}`);
      window.location.reload(); // la página se refresca sola al terminar
      
    } catch (error) {
      console.error(error); 
      alert("Error conectando con la logística.");
    } finally {
      setCargandoDespacho(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <button 
        onClick={consultarComprador}
        disabled={cargandoBuyer}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors disabled:opacity-50"
      >
        <User size={24} />
        <span className="font-semibold text-sm">
          {cargandoBuyer ? "Consultando..." : "Ver Comprador"}
        </span>
      </button>

      <button 
        onClick={consultarPago}
        disabled={cargandoPago}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors disabled:opacity-50"
      >
        <CreditCard size={24} />
        <span className="font-semibold text-sm">
          {cargandoPago ? "Verificando..." : "Consultar Pago"}
        </span>
      </button>

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