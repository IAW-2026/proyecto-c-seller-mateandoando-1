//app/api/items/descuentos/remover/route.ts
//api backend con la lógica para remover descuentos de productos seleccionados
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    // La magia de Prisma: updateMany actualiza muchos registros a la vez en un solo viaje a la BD.
    // Le decimos: "A todos estos IDs, ponele el discount_price en null"
    await db.producto.updateMany({
      where: { id_item: { in: ids } },
      data: { discount_price: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al remover descuentos:", error);
    return NextResponse.json({ error: "Fallo al quitar descuento" }, { status: 500 });
  }
}