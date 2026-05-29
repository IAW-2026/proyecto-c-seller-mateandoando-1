//app/(dashboard)/ordenes/ButtonOrden.tsx
//va a recibir la orden real que le mandó el servidor para hacer las consultas

// app/(dashboard)/ordenes/BotoneraOrden.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function BotoneraOrden({ ordenActiva }: { ordenActiva: any }) {
  const { getToken } = useAuth();
  
  const [cargandoBuyer, setCargandoBuyer] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [cargandoDespacho, setCargandoDespacho] = useState(false);

  // Extraemos nuestro paquete específico de adentro de la orden
  const miPaquete = ordenActiva.paquetes[0];

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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/${miPaquete.id_package}/dispatch`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // lo mandamos por las dudas, aunque la Shipping App ya tiene el costo y carrier asignados desde la creación del paquete
          id_package: miPaquete.id_package,
          
          // Estos dos salen directamente del paquete:
          carrier_name: miPaquete.carrier_name,
          shipping_cost: miPaquete.shipping_cost,
          // La dirección la sacamos de la orden general, no del paquete
          address_snapshot: ordenActiva.address_snapshot 
        })
      });

      if (!response.ok) throw new Error("Fallo al despachar");
      const data = await response.json();
      alert(`¡Éxito! El paquete figura como: ${data.status}`);
      
    } catch (error) {
      alert("Error conectando con la Shipping App.");
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
        <span className="text-xl">👤</span>
        <span className="font-semibold text-sm">
          {cargandoBuyer ? "Consultando..." : "Ver Comprador"}
        </span>
      </button>

      <button 
        onClick={consultarPago}
        disabled={cargandoPago}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-purple-100 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors disabled:opacity-50"
      >
        <span className="text-xl">💳</span>
        <span className="font-semibold text-sm">
          {cargandoPago ? "Verificando..." : "Consultar Pago"}
        </span>
      </button>

      <button 
        onClick={despacharPaquete}
        disabled={cargandoDespacho}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-orange-100 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors disabled:opacity-50"
      >
        <span className="text-xl">📦</span>
        <span className="font-semibold text-sm">
          {cargandoDespacho ? "Avisando..." : "Despachar Paquete"}
        </span>
      </button>
    </div>
  );
}