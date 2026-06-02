import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EstadoPaquete } from "@prisma/client"; 
import { ScanBarcode, Truck, TriangleAlert } from "lucide-react";
import ListaOrdenesPaginada from "./ListaOrdenesPaginada";

export const dynamic = "force-dynamic";
export default async function DashboardResumenPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendedorActual = await db.vendedor.findFirst({
    where: { clerk_user_id: userId }
  });

  if (!vendedorActual) {
    return <div className="p-8 text-red-500">Vendedor no encontrado.</div>;
  }

  const [totalProductos, productosInactivos, misOrdenesRaw] = await Promise.all([
    db.producto.count({ where: { id_seller: vendedorActual.id_seller } }),
    db.producto.count({ where: { id_seller: vendedorActual.id_seller,OR:[ {is_active: false},{stock: 0}]} }),
    db.ordenCompra.findMany({
      where: { paquetes: { some: { id_seller: vendedorActual.id_seller } } },
      include: { paquetes: { where: { id_seller: vendedorActual.id_seller } } },
      orderBy: { created_at: 'desc' }
    })
  ]);

  
  const misOrdenes = misOrdenesRaw.map((orden) => ({
    ...orden,
    total_price: Number(orden.total_price),
    paquetes: orden.paquetes.map(paquete => ({
      ...paquete,
      price_package: Number(paquete.price_package),
      shipping_cost: Number(paquete.shipping_cost)
    }))
  }));

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
      <div className="bg-[#8BC34A]/50 p-6 rounded-2xl border border-white/20 shadow-md hover:shadow-lg transition-all relative overflow-hidden group backdrop-blur-sm">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/30 rounded-full group-hover:scale-110 transition-transform"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">
            Total Productos
          </p>
          
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{totalProductos}</h2>
            <span className="text-sm font-bold text-emerald-800/80 mb-1">en catálogo</span>
          </div>
          
          {productosInactivos > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-orange-950 bg-white/60 backdrop-blur-md inline-flex items-center px-2.5 py-1.5 rounded-md border border-white/60 shadow-sm">
                <TriangleAlert size={16} className="text-orange-600 mr-1.5" />
                Tenés {productosInactivos} pausados
                <Link href="/productos" className="ml-2 text-orange-600 hover:text-orange-700">
                  Revisalos →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

        <div className="bg-[#8BC34A]/50 p-6 rounded-2xl border border-white/20 shadow-md hover:shadow-lg transition-all relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/30 rounded-full group-hover:scale-110 transition-transform"></div>
           <div className="relative z-10">
            <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-2">
              Para Despachar
            </p>
            
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-slate-900">{ordenesPendientes}</h2>
              <span className="text-sm font-bold text-emerald-800/80 mb-1">órdenes esperando</span>
            </div>
            
            <div className="mt-3">
              <Link 
                href="/ordenes?filtro=PREPARADO" 
                className="text-sm font-black text-emerald-950 hover:text-slate-900 hover:underline transition-colors"
              >
                Ir a gestionar envíos →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#8BC34A]/50 p-6 rounded-2xl shadow-md text-slate-900 flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Atajos</p>
            <h2 className="text-xl font-bold text-slate-900 mb-1">¿Qué querés hacer hoy?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link href="/productos" className="bg-white/60 hover:bg-white/80 transition-colors rounded-xl p-3 text-sm font-semibold text-slate-800 flex flex-col items-center justify-center gap-2 backdrop-blur-md border border-white/60 shadow-sm">
              <ScanBarcode size={20} className="text-emerald-700"/>
              Inventario
            </Link>
            <Link href="/ordenes?filtro=PREPARADO" className="bg-white/60 hover:bg-white/80 transition-colors rounded-xl p-3 text-sm font-semibold text-slate-800 flex flex-col items-center justify-center gap-2 backdrop-blur-md border border-white/60 shadow-sm">
              <Truck size={20} className="text-emerald-700" />
              Envíos Pendientes
            </Link>
          </div>
        </div>
      </div>
        {/* Renderizamos la lista de órdenes con paginación */}
      <ListaOrdenesPaginada misOrdenes={misOrdenes} />

    </div>
  );
}