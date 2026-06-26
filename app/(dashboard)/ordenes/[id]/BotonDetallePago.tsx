// app/(dashboard)/ordenes/[id]/BotonDetallePago.tsx
"use client";

import { useState } from "react";
import { CreditCard, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  idPaymentOperation: string | null;
  className?: string; // Permite que el padre le pase los colores/bordes
  children?: React.ReactNode; // Permite que el padre le pase los íconos y textos
}

export default function BotonDetallePago({ idPaymentOperation, className, children }: Props) {
  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const consultarPago = async () => {
    setModalAbierto(true);
    
    if (!idPaymentOperation) return;
    
    setCargando(true);
    setError(null);
    setDetalle(null); 

    try {
      const res = await fetch(`/api/payments/${idPaymentOperation}`);
      
      if (!res.ok) {
        throw new Error("No se pudo cargar el detalle del pago. El servidor de origen devolvió un error.");
      }

      const data = await res.json();
      setDetalle(data); 
      
    } catch (err: any) {
      setError(err.message); 
    } finally {
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setDetalle(null);
    setError(null);
    setModalAbierto(false);
  };

  return (
    <>
      <button
        onClick={consultarPago}
        disabled={cargando}
        className={className}
      >
        {cargando ? "Consultando..." : children}
      </button>

      {/* FONDO OSCURO DEL MODAL */}
      {(detalle || error) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          {/* CAJA BLANCA CENTRAL */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-black flex items-center gap-2">
                {error ? (
                  <AlertCircle className="text-red-600" size={20} />
                ) : (
                  // Ícono de éxito ahora en negro
                  <CheckCircle2 className="text-black" size={20} />
                )}
                {error ? "Error en la consulta" : "Información del Pago"}
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
              
              {/* Error mantiene su color rojo por convención de UI */}
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Detalles exitosos en paleta monocromática (negro/gris oscuro) */}
              {detalle && (
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">ID Operación</span>
                    <span className="font-mono text-xs text-black bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                      {detalle.id_payment_operation || detalle.idPaymentOperation || idPaymentOperation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">Estado</span>
                    {/* Badge de estado neutro oscuro */}
                    <span className="font-bold px-2 py-0.5 rounded-md text-xs uppercase bg-slate-100 text-black border border-slate-300">
                      {detalle.status || "DESCONOCIDO"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-600 font-medium">Fecha</span>
                    <span className="font-medium text-black">
                      {detalle.created_at || detalle.createdAt 
                        ? new Date(detalle.created_at || detalle.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                          })
                        : "No disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-600 font-medium">Monto Total</span>
                    <span className="font-black text-lg text-black">
                      ${Number(detalle.total_price || detalle.totalPrice || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              )}
              {/* SI NO HAY ID DE PAGO */}
              {!idPaymentOperation && !error && (
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-center items-center pb-2">
                    <span className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center font-medium w-full">
                      Pago aún no registrado por la plataforma
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