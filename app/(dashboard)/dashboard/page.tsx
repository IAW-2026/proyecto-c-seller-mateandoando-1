import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EstadoPaquete } from "@prisma/client"; 

export default async function DashboardResumenPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedorActual = await db.vendedor.findFirst({
    where: { clerk_user_id: userId }
  });

  if (!vendedorActual) {
    return <div className="p-8 text-red-500">Vendedor no encontrado.</div>;
  }

  const [totalProductos, productosInactivos, misOrdenes] = await Promise.all([
    db.producto.count({ where: { id_seller: vendedorActual.id_seller } }),
    db.producto.count({ where: { id_seller: vendedorActual.id_seller, is_active: false } }),
    db.ordenCompra.findMany({
      where: { paquetes: { some: { id_seller: vendedorActual.id_seller } } },
      include: { paquetes: { where: { id_seller: vendedorActual.id_seller } } },
      orderBy: { created_at: 'desc' },
      take: 4 
    })
  ]);

  // Lógica corregida: Las órdenes pendientes son las que solo están "PREPARADAS" (aún no retiradas)
  const ordenesPendientes = misOrdenes.filter(
    orden => orden.paquetes[0]?.status === EstadoPaquete.PREPARADO 
  ).length;

  return (
    <div className="w-full max-w-6xl pb-12">
      
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            ¡Hola de nuevo! 
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Acá tenés el resumen de tu tienda al día de hoy.
          </p>
        </div>
        <Link 
          href="/nuevo" 
          className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#143325] shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
        >
          + Publicar Producto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Productos</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{totalProductos}</h2>
            <span className="text-sm font-medium text-slate-400 mb-1">en catálogo</span>
          </div>
          {productosInactivos > 0 && (
            <p className="text-xs font-semibold text-orange-500 mt-3 bg-orange-50 inline-block px-2 py-1 rounded-md">
              ⚠️ Tenés {productosInactivos} pausados
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Para Despachar</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-[#1B4332]">{ordenesPendientes}</h2>
            <span className="text-sm font-medium text-slate-400 mb-1">órdenes esperando</span>
          </div>
          <div className="mt-3">
            {/* Atajo modificado con query param */}
            <Link href="/ordenes?filtro=PREPARADO" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Ir a gestionar envíos →
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Atajos</p>
            <h2 className="text-xl font-bold mb-1">¿Qué querés hacer hoy?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link href="/productos" className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 text-sm font-semibold text-center backdrop-blur-sm border border-white/5">
              📦 Inventario
            </Link>
            {/* Atajo modificado con query param */}
            <Link href="/ordenes?filtro=PREPARADO" className="flex items-center justify-center w-full h-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 text-sm font-semibold text-center backdrop-blur-sm border border-white/5">
              🚚 Envíos Pendientes
            </Link>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">
        Historial de Órdenes Recientes
      </h3>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {misOrdenes.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl block mb-3">🛍️</span>
            <p className="text-slate-500 font-medium">Aún no hay ventas registradas.</p>
            <p className="text-sm text-slate-400 mt-1">Cuando los clientes compren en la Buyer App, aparecerán acá.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {misOrdenes.map((orden) => {
              // Verificamos si ya salió del galpón
              const yaSalio = orden.paquetes[0].status === EstadoPaquete.RETIRADO || orden.paquetes[0].status === EstadoPaquete.ENTREGADO;

              return (
                <div key={orden.id_purchase_order} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Icono de estado dinámico */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${yaSalio ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {yaSalio ? "🚚" : "📦"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Orden #{orden.id_purchase_order.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-500">
                        Total: ${Number(orden.total_price).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Etiqueta con el nombre real de tu base de datos */}
                    {<span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                      ${orden.paquetes[0].status === EstadoPaquete.ENTREGADO
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : orden.paquetes[0].status === EstadoPaquete.CANCELADO
                          ? "bg-red-50 text-red-700 border-red-200"
                          : orden.paquetes[0].status === EstadoPaquete.RETIRADO
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}>
                      {orden.paquetes[0].status}
                    </span>}
                    <Link href={`/ordenes/${orden.paquetes[0].id_package}`} className="text-slate-400 hover:text-[#1B4332] transition-colors p-2 font-bold text-sm">
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}