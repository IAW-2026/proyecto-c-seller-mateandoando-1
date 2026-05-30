//app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ButtonOrden from "./ButtonOrden";

export const dynamic = "force-dynamic"; 

export default async function OrdenesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedorActual = await db.vendedor.findFirst({
    where: { clerk_user_id: userId }
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

  const misOrdenes = await db.ordenCompra.findMany({
    where: { paquetes: { some: { id_seller: vendedorActual.id_seller } } },
    include: { paquetes: { where: { id_seller: vendedorActual.id_seller } } },
    orderBy: { created_at: 'desc' }
  });

  return (
    // CAMBIO CLAVE: Sin padding duro ni mx-auto, el Layout padre se encarga de posicionarlo
    <div className="w-full">
      
      {/* Título unificado idéntico al de Nuevo Producto */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8">
        Mis Órdenes de Compra
      </h1>
      
      {misOrdenes.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-slate-500">Aún no tenés ninguna orden registrada.</p>
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
                    <span className="bg-[#e2f4c8] text-[#1B4332] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {orden.paquetes[0].status}
                    </span>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      ${Number(orden.paquetes[0].price_package).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <ButtonOrden ordenActiva={ordenParaCliente} />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}