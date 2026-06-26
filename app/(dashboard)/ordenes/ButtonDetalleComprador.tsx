// app/(dashboard)/ordenes/BotonDetalleComprador.tsx
"use client";

import { useState } from "react";
import { User, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  idBuyer: string | null;
  className?: string; 
  children?: React.ReactNode; 
}

export default function BotonDetalleComprador({ idBuyer, className, children }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const consultarComprador = async () => {
    setModalAbierto(true);
    
    if (!idBuyer) return;

    setCargando(true);
    setError(null);
    setDetalle(null);

    try {
      const response = await fetch(`/api/buyers/${idBuyer}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" } 
      });

      if (response.status === 404) {
        throw new Error("El comprador ya no existe en el sistema (cuenta eliminada o datos antiguos).");
      }
      
      if (!response.ok) {
        throw new Error("Fallo al traer los datos desde el servidor de compradores.");
      }
      
      const data = await response.json();
      setDetalle(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalle(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={consultarComprador}
        disabled={cargando}
        className={className}
      >
        {cargando ? "Consultando..." : children}
      </button>

      {/* FONDO OSCURO DEL MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-black flex items-center gap-2">
                {error ? (
                  <AlertCircle className="text-red-600" size={20} />
                ) : (
                  <CheckCircle2 className="text-black" size={20} />
                )}
                {error ? "Error en la consulta" : "Información del Comprador"}
              </h3>
              <button 
                onClick={cerrarModal}
                className="text-slate-500 hover:text-black bg-slate-50 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* CUERPO DEL MODAL */}
            <div className="p-5 flex flex-col gap-4">
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* SI HAY DETALLE (Comprador encontrado) */}
              {detalle && (
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">Nombre Completo</span>
                    <span className="font-medium text-black text-right">
                      {`${detalle.first_name || ''} ${detalle.last_name || ''}`.trim() || "Usuario anónimo"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">Teléfono de Contacto</span>
                    <span className="font-mono text-xs text-black bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                      {detalle.phone || "No registrado"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">Estado de Cuenta</span>
                    <span className="font-bold px-2 py-0.5 rounded-md text-xs uppercase bg-slate-100 text-black border border-slate-300">
                      {detalle.status || "DESCONOCIDO"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-600 font-medium">ID Interno</span>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">
                      {detalle.id_buyer || idBuyer}
                    </span>
                  </div>
                </div>
              )}

              {/* SI NO HAY ID DE COMPRADOR */}
              {!idBuyer && !error && (
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-center items-center pb-2">
                    <span className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center font-medium w-full">
                      ID de comprador no disponible en esta orden
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* PIE DEL MODAL */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={cerrarModal}
                className="bg-black hover:bg-slate-800 text-white text-sm font-bold py-2 px-6 rounded-xl transition-colors w-full sm:w-auto"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}