//app/(dashboard)/ordenes/[id]/BotonDespachar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotonDespachar({ datosDespacho }: { datosDespacho: any }) {
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const iniciarDespacho = async () => {
    setProcesando(true);
    
    try {
      // Le pegamos a TU ruta interna y le mandamos TODOS los datos
      const resLocal = await fetch(`/api/packages/${datosDespacho.id_package}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // ACÁ ESTÁ EL CAMBIO: Mandamos el paquetito de datos completo
        body: JSON.stringify(datosDespacho) 
      });

      if (!resLocal.ok) {
        const errorData = await resLocal.json(); 
        throw new Error(errorData.error || "Error desconocido al actualizar la BD");
      }

      // Si todo salió bien, recargamos la página para ver el progreso verde
      router.refresh();

    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error. Revisá la consola.");
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