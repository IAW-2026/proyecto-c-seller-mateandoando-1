import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const fechaCorte = new Date("2026-06-21T00:00:00-03:00");
  try {
    // 1. VOLUMEN DE VENTAS (Suma de paquetes NO cancelados ni pendientes)
    // Usamos paquetes porque el dinero se divide por vendedor en la Seller App
    const volumenResult = await db.paquete.aggregate({
      _sum: {
        price_package: true,
      },
      where: {
        status: {
          notIn: ["CANCELADO", "PENDIENTE"],
        },
        ordenCompra: {
          created_at: {
            gte: fechaCorte,
          }
        }
      },
    });
    const volumenTransaccionado = Number(volumenResult._sum.price_package || 0);

    // 2. CONTEO DE ÓRDENES Y PAQUETES
    const totalOrdenes = await db.ordenCompra.count({
      where: {
      created_at: {
      gte: fechaCorte,
    },}
    });

    const totalPaquetes = await db.paquete.count({
      where: { status: { notIn: ["CANCELADO", "PENDIENTE"] } }
    });

    // 3. ESTADÍSTICAS DE PRODUCTOS Y VENDEDORES
    const totalProductosActivos = await db.producto.count({
      where: { is_active: true }
    });
    
    const totalVendedores = await db.vendedor.count();

    // 4. DESGLOSE DE PAQUETES POR ESTADO (Para la tabla detallada)
    const paquetesPorEstadoRaw = await db.paquete.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Formateamos el agrupamiento para que el frontend lo lea fácil
    const desglosePorEstado = paquetesPorEstadoRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    // 5. TICKET PROMEDIO
    const ticketPromedio = totalOrdenes > 0 ? (volumenTransaccionado / totalOrdenes) : 0;

    // --- ARMAMOS LA RESPUESTA ---
    return NextResponse.json({
      general: {
        volumen_transaccionado_ars: volumenTransaccionado,
        total_ordenes_validas: totalOrdenes,
        total_productos_activos: totalProductosActivos,
        total_vendedores: totalVendedores,
      },
      detailed: {
        ticket_promedio_ars: Number(ticketPromedio.toFixed(2)),
        total_paquetes_vendidos: totalPaquetes,
        by_status: desglosePorEstado,
      }
    });

  } catch (error) {
    console.error("Error obteniendo analytics de Seller:", error);
    return NextResponse.json(
      { error: "Error interno calculando métricas" },
      { status: 500 }
    );
  }
}