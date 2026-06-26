// app/(dashboard)/ordenes/[id]/BotonDespachar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import { Hourglass, Rocket, AlertTriangle } from "lucide-react"; // Sumamos el ícono de alerta

export default function BotonDespachar({ 
  datosDespacho, 
  idPaymentOperation 
}: { 
  datosDespacho: any;
  idPaymentOperation: string | null;
}) {
  const [procesando, setProcesando] = useState(false);
  const [estadoPago, setEstadoPago] = useState<string | null>(null);
  const [verificandoPago, setVerificandoPago] = useState(true);
  const router = useRouter();

  // 1. Verificamos el estado del pago al cargar el componente
  useEffect(() => {
    const verificarPago = async () => {
      if (!idPaymentOperation) {
        setEstadoPago("SIN_REGISTRAR");
        setVerificandoPago(false);
        return;
      }
      try {
        const res = await fetch(`/api/payments/${idPaymentOperation}`);
        if (!res.ok) throw new Error("Error al consultar la API de pagos");
        const data = await res.json();
        setEstadoPago(data.status); // Ej: "APROBADO", "PENDIENTE", "RECHAZADO"
      } catch (error) {
        console.error("Error verificando pago:", error);
        setEstadoPago("ERROR_CONSULTA");
      } finally {
        setVerificandoPago(false);
      }
    };

    verificarPago();
  }, [idPaymentOperation]);

  const iniciarDespacho = async () => {
    // 2. Doble validación: evitamos que se ejecute si logran habilitar el botón desde consola
    if (estadoPago !== "APROBADO") {
      toast.error("No podés despachar. El pago no está aprobado.");
      return;
    }

    setProcesando(true);
    
    try {
      const resLocal = await fetch(`/api/packages/${datosDespacho.id_package}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosDespacho) 
      });

      if (!resLocal.ok) {
        const errorData = await resLocal.json(); 
        throw new Error(errorData.error || "Error desconocido al actualizar la BD");
      }

      router.refresh();
      toast.success("¡Despacho iniciado con éxito!"); 
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error. Revisá la consola."); 
    } finally {
      setProcesando(false);
    }
  };

  const puedeDespachar = estadoPago === "APROBADO";

  // Muestra un esqueleto cargando mientras consulta a la API
  if (verificandoPago) {
    return (
      <div className="w-full bg-slate-100 text-slate-500 py-3 px-4 rounded-xl font-bold text-sm text-center animate-pulse">
        Verificando estado del pago...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 3. Cartel de advertencia si el pago no está aprobado */}
      {!puedeDespachar && (
        <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 font-medium flex items-start gap-2 leading-relaxed shadow-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Acción bloqueada:</strong> El pago se encuentra en estado <span className="uppercase font-bold">"{estadoPago}"</span>. Solo podés despachar paquetes con pagos aprobados.
          </span>
        </div>
      )}

      {/* 4. Botón dinámico (Se vuelve gris si no se puede despachar) */}
      <button 
        onClick={iniciarDespacho}
        disabled={procesando || !puedeDespachar}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 
          ${!puedeDespachar 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
            : procesando 
            ? 'bg-[#1B4332] text-white opacity-50 cursor-wait' 
            : 'bg-[#1B4332] text-white hover:bg-[#143325] active:scale-[0.98]'
          }`}
      >
        {procesando ? <Hourglass size={20} /> : <Rocket size={20} />}
        {procesando ? "Iniciando..." : !puedeDespachar ? "Despacho Bloqueado" : "Despachar Paquete"}
      </button>
    </div>
  );
}