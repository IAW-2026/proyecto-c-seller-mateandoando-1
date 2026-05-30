//app/(dashboard)/ordenes/ButtonOrden.tsx
//va a recibir la orden real que le mandó el servidor para hacer las consultas

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
      
      // Le avisamos a Shipping App
      const responseShipping = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/${miPaquete.id_package}/dispatch`, {
        // Agregamos el método PATCH
        method: "PATCH", 
        // Agregamos los headers (Avisando que mandamos un JSON y pasando el token del usuario)
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // Armamos el body exactamente como lo pide la api
        body: JSON.stringify({
          id_package: miPaquete.id_package,
          carrier_name: miPaquete.carrier_name,
          address_snapshot: ordenActiva.address_snapshot,
          shipping_cost: miPaquete.shipping_cost,
          id_user: ordenActiva.id_buyer
        })
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

      {ordenActiva.paquetes[0].id_shipments ? (
        <a 
          href={`${process.env.NEXT_PUBLIC_SHIPPING_URL}/tracking/${ordenActiva.paquetes[0].id_shipments}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-center"
        >
          <span className="text-xl">🚚</span>
          <span className="font-semibold text-sm">Seguir Envío</span>
        </a>
      ) : (
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
      )}
    </div>
  );
}