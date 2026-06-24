// app/api/purchase-orders/[id_purchase_order]/payment/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const body = await request.json();
    console.log("====================================");
    console.log("¡WEBHOOK DISPARADO DESDE PAYMENTS!");
    console.log("Datos crudos recibidos:", body);
    console.log("====================================");
    const { status, id_payment_operation } = body;

    const orden = await db.ordenCompra.findUnique({
      where: { id_purchase_order },
      include: { paquetes: { include: { articulos: true } } }
    });

    if (!orden) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    // Invalidamos la caché de las páginas que muestran órdenes
      revalidatePath("/dashboard");
      revalidatePath("/ordenes");

    if (status === "APROBADO") {
      await db.$transaction([
        db.ordenCompra.update({
          where: { id_purchase_order: id_purchase_order },
          data: { status: "PAGADA",
            id_payment_operation: body.id_payment_operation
           }
        }),
        db.paquete.updateMany({
          where: { id_purchase_order: id_purchase_order },
          data: { status: "PREPARADO" } 
        })
      ]);
      
      return NextResponse.json({
        id_purchase_order: id_purchase_order,
        status: "PAGADA",
        packages_status: "PREPARADO"
      }, { status: 200 });
    }

    if (status === "RECHAZADO") {
      await db.$transaction(async (tx) => {
       await tx.ordenCompra.update({
          where: { id_purchase_order },
          data: { status: "CANCELADA" }
        });

        await tx.paquete.updateMany({
          where: { id_purchase_order },
          data: { status: "CANCELADO" }
        });

        for (const paquete of orden.paquetes) {
          for (const articulo of paquete.articulos) {
            await tx.producto.update({
              where: { id_item: articulo.id_item },
              data: { stock: { increment: articulo.quantity } }
            });
          }
        }
      });

      return NextResponse.json({
        id_purchase_order: id_purchase_order,
        status: "CANCELADA",
        packages_status: "CANCELADO",
        message: "Stock de productos restaurado"
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Status inválido" }, { status: 400 });

  } catch (error) {
    console.error("Error en webhook de pago:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}