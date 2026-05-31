//app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ButtonOrden from "./ButtonOrden";
import Link from "next/link"; 
import { EstadoPaquete } from ".prisma/client/default.js";

export const dynamic = "force-dynamic"; 

// 1. Recibimos los searchParams por props
export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedorActual = await db.vendedor.findFirst({
    where: { clerk_user_id: userId },
  });

  if (!vendedorActual) {
    return (
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8">Mis Órdenes de Compra</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Error: Tu usuario de Clerk no está registrado en la base de datos.
        </div>
      </div>
    );
  }
  // 2. Leemos qué filtro pide la URL
  const { filtro } = await searchParams;
  const filtroAplicado = filtro === "PREPARADO" ? EstadoPaquete.PREPARADO : filtro === "ENTREGADO" ? EstadoPaquete.ENTREGADO : filtro === "CANCELADO" ? EstadoPaquete.CANCELADO : filtro === "RETIRADO" ? EstadoPaquete.RETIRADO : undefined;

  // 3. Le pasamos el filtro dinámico a Prisma
  const misOrdenes = await db.ordenCompra.findMany({
    where: {
      paquetes: {
        some: {
          id_seller: vendedorActual.id_seller,
          // Si hay filtro, busca solo esas. Si es undefined, ignora esta línea y trae todas.
          ...(filtroAplicado ? { status: filtroAplicado } : {}), 
        },
      },
    },
    include: {
      paquetes: {
        where: { id_seller: vendedorActual.id_seller },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8">
        Mis Órdenes de Compra
      </h1>
      {/*Pestañas visuales de navegación */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Link
            href="/ordenes"
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              !filtro ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Todas
          </Link>
          <Link
            href="/ordenes?filtro=PREPARADO"
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              filtro === "PREPARADO" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pendientes
          </Link>
          <Link
            href="/ordenes?filtro=ENTREGADO"
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              filtro === "ENTREGADO" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Entregadas
          </Link>
          <Link
            href="/ordenes?filtro=CANCELADO"
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              filtro === "CANCELADO" ? "bg-white text-red-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Canceladas
          </Link>
         <Link
            href="/ordenes?filtro=RETIRADO"
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              filtro === "RETIRADO" ? "bg-white text-yellow-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Retiradas
          </Link>
        </div>
      {misOrdenes.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-slate-500">Aún no tenés ninguna orden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {misOrdenes.map((orden) => {
            const ordenParaCliente = {
              ...orden,
              total_price: Number(orden.total_price),
              paquetes: orden.paquetes.map(paquete => ({
                ...paquete,
                price_package: Number(paquete.price_package),
                shipping_cost: Number(paquete.shipping_cost)
              }))
            };

            return (
              <div key={orden.id_purchase_order} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-4">
                  <div>
                    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md mb-2 tracking-wide">
                      ORDEN #{orden.id_purchase_order.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-sm text-slate-500 mt-1">Paquete: {orden.paquetes[0].id_package.slice(-6)}</p>
                  </div>
                  
                  <div className="text-right">
                    {orden.paquetes[0].status === EstadoPaquete.ENTREGADO
                    ? <span className="bg-[#e2f4c8] text-[#1B4332] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {orden.paquetes[0].status}
                    </span>
                    : orden.paquetes[0].status === EstadoPaquete.CANCELADO
                    ? <span className="bg-[#fce8e6] text-[#9b2c2c] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {orden.paquetes[0].status}
                    </span>
                    : orden.paquetes[0].status === EstadoPaquete.RETIRADO
                    ? <span className="bg-[#dbeafe] text-[#1e40af] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {orden.paquetes[0].status}
                    </span>
                    : <span className="bg-[#fef3c7] text-[#92400e] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {orden.paquetes[0].status}
                    </span> }
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      ${Number(orden.paquetes[0].price_package).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                {/* Contenedor flex para agrupar los botones y el enlace */}
                <div className="mt-auto flex flex-col gap-4">
                  <ButtonOrden ordenActiva={ordenParaCliente} />
                  
                  <div className="flex justify-center border-t border-gray-100 pt-4">
                    <Link 
                      href={`/ordenes/${orden.paquetes[0].id_package}`} 
                      className="text-slate-400 hover:text-[#1B4332] transition-colors font-bold text-sm flex items-center gap-1.5 p-1 px-3 rounded-lg hover:bg-green-50"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}