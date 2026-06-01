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

  // Sincroniza el botón de PC con el del Celular
  useEffect(() => {
    setActivo(estadoInicial);
  }, [estadoInicial]);
 const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "success" });

  const mostrarToast = (mensaje: string, tipo: "success" | "error" = "success") => {
    setToast({ visible: true, mensaje, tipo });
    // Desaparece automáticamente a los 3.5 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };
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

      if (!response.ok) throw new Error("Fallo al actualizar el estado del producto");
      router.refresh();
      mostrarToast(`Producto ${nuevoEstado ? "activado" : "pausado"} con éxito`);
    } catch (error) {
      setActivo(!nuevoEstado);
      mostrarToast("Hubo un error al cambiar el estado del producto.", "error");
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
      {/* =========================================================
          COMPONENTE TOAST (Notificación Flotante)
      ========================================================= */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
          toast.tipo === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-xl">
            {toast.tipo === "success" ? "✨" : "⚠️"}
          </span>
          <p className="font-bold text-sm">{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
}