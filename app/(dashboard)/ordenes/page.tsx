//app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EstadoPaquete } from ".prisma/client/default.js";
import GridOrdenesPaginado from "./GridOrdenesPaginado";
import FiltrosOrdenes from "./FiltrosOrdenes"; // <-- 1. Importamos tu nuevo componente

export const dynamic = "force-dynamic"; 

export default async function OrdenesPage({
  searchParams,
}: {
  // 2. Le avisamos que ahora también puede recibir 'q' (nuestra búsqueda)
  searchParams: Promise<{ filtro?: string; q?: string }>;
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

  // 3. Extraemos tanto el filtro como el texto buscado
  const { filtro, q } = await searchParams;
  
  const filtroAplicado = 
    filtro === "PREPARADO" ? EstadoPaquete.PREPARADO : 
    filtro === "ENTREGADO" ? EstadoPaquete.ENTREGADO : 
    filtro === "CANCELADO" ? EstadoPaquete.CANCELADO : 
    filtro === "RETIRADO" ? EstadoPaquete.RETIRADO : undefined;

  // 4. Se lo pasamos a Prisma
  const misOrdenes = await db.ordenCompra.findMany({
    where: {
      // Magia pura: Si 'q' tiene texto, busca en el id de la orden
      ...(q ? { id_purchase_order: { contains: q, mode: "insensitive" } } : {}),
      
      paquetes: {
        some: {
          id_seller: vendedorActual.id_seller,
          // Mantiene tu filtro de estados original
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
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-6">
        Mis Órdenes de Compra
      </h1>
      
      {/* 5. Reemplazamos las pestañas viejas por nuestro componente combinado */}
      <FiltrosOrdenes />

      <GridOrdenesPaginado misOrdenes={ordenesFormateadas} />
    </div>
  );
}