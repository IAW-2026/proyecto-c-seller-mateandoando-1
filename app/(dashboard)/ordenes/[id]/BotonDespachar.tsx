// app/(dashboard)/ordenes/[id]/BotonDespachar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

export default function BotonDespachar({ datosDespacho }: { datosDespacho: any }) {
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const iniciarDespacho = async () => {
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

  return (
    <button 
      onClick={iniciarDespacho}
      disabled={procesando}
      className={`w-full bg-[#1B4332] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-[#143325] shadow-md transition-all flex items-center justify-center gap-2 ${procesando ? 'opacity-50 cursor-wait' : 'active:scale-[0.98]'}`}
    >
      {procesando ? "⏳ Procesando..." : "🚀 Iniciar Despacho"}
    </button>
  );
}