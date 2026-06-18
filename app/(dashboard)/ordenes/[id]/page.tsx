//app/(dashboard)/ordenes/[id]/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { EstadoPaquete } from "@prisma/client";
import BotonDespachar from "./BotonDespachar";
import BotonDetallePago from "./BotonDetallePago";
import {Package, Truck, House} from "lucide-react";

export default async function DetallePaquetePage(props: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await props.params;

  // 1. Prisma Include: Traemos los artículos y sus productos anidados
  const paquete = await db.paquete.findUnique({
    where: { id_package: params.id },
    include: {
      ordenCompra: true,
      articulos: {
        include: {
          producto: true, 
        }
      }
    },
  });

  if (!paquete) notFound();

  // 2. Cálculos Matemáticos: Sumamos el precio * cantidad de todos los artículos del paquete
  const subtotalProductos = paquete.articulos.reduce(
    (acc, art) => acc + (Number(art.sale_price) * art.quantity), 
    0
  );
  const costoEnvio = Number(paquete.shipping_cost);
  const totalPaquete = subtotalProductos + costoEnvio;

  const pasos = [
    { estado: EstadoPaquete.PREPARADO, etiqueta: "Preparado", icono: <Package size={24} /> },
    { estado: EstadoPaquete.RETIRADO, etiqueta: "En Camino", icono: <Truck size={24} /> },
    { estado: EstadoPaquete.ENTREGADO, etiqueta: "Entregado", icono: <House size={24} /> },
  ];

  const indiceActual = pasos.findIndex((p) => p.estado === paquete.status);
  // Creamos un objeto simple, sin fechas locas ni decimales de Prisma
  const datosParaDespachar = {
    id_package: paquete.id_package,
    carrier_name: paquete.carrier_name,
    address_snapshot: paquete.ordenCompra.address_snapshot,
    shipping_cost: Number(paquete.shipping_cost),
    id_buyer: paquete.ordenCompra.id_buyer
  };

  return (
    <div className="w-full max-w-4xl pb-12">
      
      {/* ENCABEZADO */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/ordenes" className="text-sm font-bold text-slate-500 hover:text-[#1B4332] transition-colors flex items-center gap-1 mb-2">
            ← Volver a Ordenes
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Detalle del Paquete #{paquete.id_package.slice(-6).toUpperCase()}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Asociado a la Orden de Compra: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{paquete.id_purchase_order}</span>
          </p>
        </div>
        
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-center border ${
          paquete.status === EstadoPaquete.ENTREGADO 
            ? "bg-green-50 text-green-700 border-green-200" 
            : paquete.status === EstadoPaquete.CANCELADO 
            ? "bg-red-50 text-red-700 border-red-200"
            : paquete.status === EstadoPaquete.RETIRADO
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {paquete.status}
        </span>
      </div>

      {/* LÍNEA DE TIEMPO */}
      {paquete.status !== EstadoPaquete.CANCELADO && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Estado del Despacho</h2>
          <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1B4332] z-0 rounded transition-all duration-500"
              style={{ width: `${(indiceActual / (pasos.length - 1)) * 100}%` }}
            ></div>

            {pasos.map((paso, idx) => {
              const completado = idx <= indiceActual;
              return (
                <div key={paso.estado} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm border transition-all duration-300 ${
                    completado 
                      ? "bg-[#1B4332] border-[#1B4332] text-white scale-110" 
                      : "bg-white border-gray-200 text-slate-400"
                  }`}>
                    {paso.icono}
                  </div>
                  <span className={`text-xs font-bold mt-2 ${completado ? "text-slate-800" : "text-slate-400"}`}>
                    {paso.etiqueta}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRILLA PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-gray-50 pb-2">Artículos en el Paquete</h3>
            
            {/* 3. Mapeo Dinámico: Iteramos sobre todos los artículos del paquete */}
            <div className="flex flex-col gap-4">
              {paquete.articulos.map((art) => (
                <div key={art.id_item_package} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <img 
                    src={art.producto.image_url} 
                    alt={art.producto.name} 
                    className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-lg truncate">{art.producto.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">Cantidad: {art.quantity} un.</p>
                  </div>
                  <p className="font-black text-slate-900 text-lg">${Number(art.sale_price).toLocaleString('es-AR')}</p>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-gray-50 pb-2">Información Logística (Contrato)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold text-xs uppercase">Empresa de Correo</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  {paquete.carrier_name || "No asignado"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-semibold text-xs uppercase">Costo de Envío</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  ${costoEnvio.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <span className="text-slate-400 font-semibold text-xs uppercase">Dirección de Entrega (Snapshot)</span>
                <span className="font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed">
                  {paquete.ordenCompra.address_snapshot}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-gray-50 pb-2">Resumen Financiero</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Productos</span>
                <span>${subtotalProductos.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Costo de Envío</span>
                <span>${costoEnvio.toLocaleString('es-AR')}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="font-bold text-slate-800">Total Neto</span>
                <span className="text-xl font-black text-[#1B4332]">${totalPaquete.toLocaleString('es-AR')}</span>
              </div>
              <BotonDetallePago idPaymentOperation={paquete.ordenCompra.id_payment_operation} />
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones Disponibles</h4>
            {paquete.status === EstadoPaquete.PREPARADO ? (
              <BotonDespachar datosDespacho={datosParaDespachar} />
            ) : (
              <p className="text-xs font-medium text-slate-500 bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
                Este paquete ya ha sido procesado y no requiere acciones adicionales.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}