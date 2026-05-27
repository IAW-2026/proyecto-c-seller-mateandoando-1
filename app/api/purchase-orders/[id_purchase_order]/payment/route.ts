// app/api/purchase-orders/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

import type { Producto, Vendedor, EstadoOrden, EstadoPaquete} from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id_purchase_order: string;
  }>;
}


//8. PATCH /api/purchase-orders/{id_purchase_order}/payment
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id_purchase_order } = await params;
    const body = await request.json();
    const { payment_status } = body;

    if (!payment_status || !["PAGADA", "CANCELADA"].includes(payment_status) || !id_purchase_order) {
     return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    };
    const newOrderStatus: EstadoOrden = payment_status === "PAGADA" ? "PAGADA" : "CANCELADA";
    const newPackageStatus: EstadoPaquete = payment_status === "PAGADA" ? "PREPARADO" : "CANCELADO";
    const response = {
      id_purchase_order: id_purchase_order,
      status: newOrderStatus,
      packages_status:newPackageStatus,
    };
    await db.ordenCompra.update({
      where: { id_purchase_order },
      data: {
        status: response.status,
        paquetes: {
          updateMany: {
            where: {},
            data: { status: response.packages_status },
          },
        },
      },
    });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error actualizando el estado de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar el estado de pago" },
      { status: 500 }
    );
  }
}
