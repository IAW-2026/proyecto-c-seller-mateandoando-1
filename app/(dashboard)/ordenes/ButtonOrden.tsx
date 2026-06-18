//app/(dashboard)/ordenes/ButtonOrden.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link"; // Corregida la ruta de importación de Link
import { User, CreditCard, Ban, Package, House, Truck } from "lucide-react";

export default function BotoneraOrden({ ordenActiva }: { ordenActiva: any }) {
  const { getToken } = useAuth();
  
  const [cargandoBuyer, setCargandoBuyer] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);

  // Extraemos nuestro paquete específico de adentro de la orden
  const miPaquete = ordenActiva.paquetes[0];
  const esCancelado = miPaquete.status === "CANCELADO";
  const esPreparado = miPaquete.status === "PREPARADO";
  const esEntregado = miPaquete.status === "ENTREGADO";

  const consultarComprador = async () => {
    setCargandoBuyer(true);
    try {
      // Dejamos esto tal cual está hasta que Gonzalo te pase la API Key o destrabe el CORS/Clerk
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

      // Le pegamos a NUESTRA API interna para proteger la API Key
      const response = await fetch(`/api/payments/${ordenActiva.id_payment_operation}`);

      if (!response.ok) throw new Error("Fallo al consultar pago");
      const data = await response.json();
      alert(`Estado del pago: ${data.status}\nFecha de creación: ${new Date(data.created_at).toLocaleDateString()}`);
    } catch (error) {
      alert("Error conectando con nuestro servidor interno de pagos.");
    } finally {
      setCargandoPago(false);
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