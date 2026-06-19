//app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EstadoPaquete } from ".prisma/client/default.js";
import GridOrdenesPaginado from "./GridOrdenesPaginado";
import FiltrosOrdenes from "./FiltrosOrdenes"; 

export const dynamic = "force-dynamic"; 

export default async function OrdenesPage({
  searchParams,
}: {
  //Le avisamos que ahora también puede recibir 'q' (nuestra búsqueda)
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

  // Extraemos tanto el filtro como el texto buscado
  const { filtro, q } = await searchParams;
  
  const filtroAplicado = 
    filtro === "PREPARADO" ? EstadoPaquete.PREPARADO : 
    filtro === "ENTREGADO" ? EstadoPaquete.ENTREGADO : 
    filtro === "CANCELADO" ? EstadoPaquete.CANCELADO : 
    filtro === "RETIRADO" ? EstadoPaquete.RETIRADO : undefined;

  // --- INICIO LIMPIEZA AUTOMÁTICA DE ÓRDENES HUÉRFANAS ---
  // Calculamos el límite (8 horas atrás)
  const limiteTiempo = new Date();
  limiteTiempo.setHours(limiteTiempo.getHours() - 8);

  // 1. Buscamos órdenes que quedaron colgadas
  const ordenesExpiradas = await db.ordenCompra.findMany({
    where: {
      status: "CREADA",
      created_at: { lt: limiteTiempo }
    },
    include: { paquetes: { include: { articulos: true } } }
  });

  // 2. Si hay órdenes viejas, las cancelamos y devolvemos el stock
  if (ordenesExpiradas.length > 0) {
    await db.$transaction(async (tx) => {
      for (const orden of ordenesExpiradas) {
        
        // Pasamos la orden a CANCELADA
        await tx.ordenCompra.update({
          where: { id_purchase_order: orden.id_purchase_order },
          data: { status: "CANCELADA" }
        });
        
        // Pasamos los paquetes huérfanos a CANCELADO
        await tx.paquete.updateMany({
          where: { id_purchase_order: orden.id_purchase_order },
          data: { status: "CANCELADO" }
        });

        // Devolvemos las unidades al stock en Neon
        for (const paquete of orden.paquetes) {
          for (const articulo of paquete.articulos) {
            await tx.producto.update({
              where: { id_item: articulo.id_item },
              data: { stock: { increment: articulo.quantity } }
            });
          }
        }
      }
    });
    console.log(`Se limpiaron ${ordenesExpiradas.length} órdenes huérfanas de forma automática.`);
  }
  // --- FIN LIMPIEZA AUTOMÁTICA ---

  const misOrdenes = await db.ordenCompra.findMany({
    where: {
      // Magia pura: Si 'q' tiene texto, busca en el id de la orden
      ...(q ? { id_purchase_order: { contains: q, mode: "insensitive" } } : {}),
      
      paquetes: {
        some: {
          id_seller: vendedorActual.id_seller,
          // Mantiene tu filtro de estados original
          status: filtroAplicado ? filtroAplicado : { not: "PENDIENTE" },
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
      
      <FiltrosOrdenes />

      <GridOrdenesPaginado misOrdenes={ordenesFormateadas} />
    </div>
  );
}