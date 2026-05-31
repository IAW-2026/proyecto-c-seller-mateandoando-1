//app/api/purchase-orders/[id_purchase_order]/refund/route.ts

import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id_purchase_order: string }> }
) {
  try {
    // --- BARRERA DE SEGURIDAD ---
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.PAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: "Acceso denegado. API Key inválida o faltante." }, 
        { status: 401 }
      );
    }
    // ----------------------------

    const { id_purchase_order } = await params;

    const orden = await db.ordenCompra.findUnique({
      where: { id_purchase_order },
      include: { paquetes: { include: { articulos: true } } }
    });

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const paqueteEnTransito = orden.paquetes.some(
      (p) => p.status === "RETIRADO" || p.status === "ENTREGADO"
    );

    if (paqueteEnTransito) {
      const paqueteDespachado = orden.paquetes.find(
        (p) => p.status === "RETIRADO" || p.status === "ENTREGADO"
      );
      
      return NextResponse.json({ 
        error: "Reembolso denegado. El paquete ya está en poder del correo o fue entregado.",
        codigo: "PAQUETE_EN_TRANSITO",
        current_package_status: paqueteDespachado?.status || "RETIRADO"
      }, { status: 400 });
    }

    await db.ordenCompra.update({
      where: { id_purchase_order },
      data: { status: "CANCELADA" }
    });

    await db.paquete.updateMany({
      where: { id_purchase_order },
      data: { status: "CANCELADO" }
    });

    for (const paquete of orden.paquetes) {
      for (const articulo of paquete.articulos) {
        await db.producto.update({
          where: { id_item: articulo.id_item },
          data: { stock: { increment: articulo.quantity } }
        });
      }
    }

    return NextResponse.json({
      id_purchase_order: id_purchase_order,
      status: "CANCELADA",
      refund_status: "AUTORIZADO",
      packages_status: "CANCELADO",
      message: "Stock de productos restaurado"
    }, { status: 200 });

  } catch (error) {
    console.error("Error en solicitud de reembolso:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}