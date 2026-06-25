// app/api/sellers/analytics/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Calculamos la ventana de tiempo: Últimos 30 días
  const fechaCorte = new Date();
  fechaCorte.setDate(fechaCorte.getDate() - 30);

  try {
    // 1. VOLUMEN DE VENTAS Y CONTEOS (Lo que ya tenías)
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

    const totalOrdenes = await db.ordenCompra.count({
      where: {
        created_at: { gte: fechaCorte },
        status: { notIn: ["CANCELADA"] }
      }
    });

    const totalPaquetes = await db.paquete.count({
      where: { 
        status: { notIn: ["CANCELADO", "PENDIENTE"] },
        ordenCompra: { created_at: { gte: fechaCorte } }
      }
    });

    const totalProductosActivos = await db.producto.count({ where: { is_active: true } });
    const totalVendedores = await db.vendedor.count();

    const paquetesPorEstadoRaw = await db.paquete.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const desglosePorEstado = paquetesPorEstadoRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    const ticketPromedio = totalOrdenes > 0 ? (volumenTransaccionado / totalOrdenes) : 0;

    // =========================================================
    // 2. NUEVOS KPIs PARA EL DASHBOARD AVANZADO
    // =========================================================

    // A. Top Vendedores (Ordenados por ventas históricas)
    const topVendedores = await db.vendedor.findMany({
      orderBy: { sales_made: 'desc' },
      take: 5, // Top 5
      select: {
        name: true,
        sales_made: true,
      }
    });

    // B. Alertas de Stock Inactivo / Agotado
    const stockInactivo = await db.producto.findMany({
      where: {
        is_active: true,
        stock: { lte: 0 } // Productos activos pero sin stock
      },
      take: 5,
      select: {
        name: true,
        stock: true,
      }
    });

    // C. Evolución de Ventas Diarias (Para el gráfico de Recharts)
    // Traemos todas las órdenes de los últimos 30 días
    const ordenesRecientes = await db.ordenCompra.findMany({
      where: {
        created_at: { gte: fechaCorte },
        status: { notIn: ["CANCELADA"] }
      },
      select: {
        created_at: true,
        total_price: true
      }
    });

    // Creamos un mapa con los últimos 30 días inicializados en 0 para que el gráfico no tenga "huecos"
    const ventasDiariasMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      ventasDiariasMap.set(dateStr, 0);
    }

    // Sumamos el total de cada orden al día correspondiente
    ordenesRecientes.forEach((orden) => {
      const dateStr = new Date(orden.created_at).toISOString().split('T')[0];
      if (ventasDiariasMap.has(dateStr)) {
        const actual = ventasDiariasMap.get(dateStr)!;
        ventasDiariasMap.set(dateStr, actual + Number(orden.total_price));
      }
    });

    // Convertimos el mapa en un array compatible con librerías de gráficos
    const evolucionVentas = Array.from(ventasDiariasMap.entries()).map(([fecha, total]) => ({
      fecha,
      ingresos: total
    }));

    // --- ARMAMOS LA RESPUESTA FINAL ---
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
      },
      charts: {
        top_vendedores: topVendedores,
        stock_inactivo: stockInactivo,
        evolucion_ventas: evolucionVentas
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