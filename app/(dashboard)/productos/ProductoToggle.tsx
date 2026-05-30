//app/(dashboard)/productos/ProductoToggle.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductoToggle({ 
  productoId, 
  estadoInicial 
}: { 
  productoId: string; 
  estadoInicial: boolean;
}) {
  const [activo, setActivo] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // ACÁ ESTÁ EL USEEFFECT: Sincroniza el botón de PC con el del Celular
  useEffect(() => {
    setActivo(estadoInicial);
  }, [estadoInicial]);

  const toggleEstado = async () => {
    setCargando(true);
    const nuevoEstado = !activo;
    setActivo(nuevoEstado);

    try {
      const response = await fetch(`/api/items/${productoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nuevoEstado }),
      });

      if (!response.ok) throw new Error("Fallo al actualizar");
      router.refresh();
      
    } catch (error) {
      setActivo(!nuevoEstado);
      alert("Hubo un error al cambiar el estado del producto.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleEstado}
        disabled={cargando}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-2 ${activo ? "bg-[#1B4332]" : "bg-gray-300"} ${cargando ? "opacity-50 cursor-wait" : ""}`}
        role="switch"
        aria-checked={activo}
      >
        <span className="sr-only">Activar producto</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activo ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
      
      <span className={`text-xs font-bold tracking-wide ${activo ? "text-[#1B4332]" : "text-slate-400"}`}>
        {activo ? "Activo" : "Pausado"}
      </span>
    </div>
  );
}