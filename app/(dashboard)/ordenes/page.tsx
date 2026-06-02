//app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ButtonOrden from "./ButtonOrden";
import Link from "next/link"; 
import { EstadoPaquete } from ".prisma/client/default.js";
import GridOrdenesPaginado from "./GridOrdenesPaginado";

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
  const ordenesFormateadas = misOrdenes.map((orden) => ({
    ...orden,
    total_price: Number(orden.total_price),
    paquetes: orden.paquetes.map(paquete => ({
      ...paquete,
      price_package: Number(paquete.price_package),
      shipping_cost: Number(paquete.shipping_cost)
    }))
  }));
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
      <GridOrdenesPaginado misOrdenes={ordenesFormateadas} />
    </div>
  );
}