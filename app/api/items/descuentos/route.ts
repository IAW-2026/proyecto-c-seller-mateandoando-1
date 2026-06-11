//app/api/items/descuentos/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { ids, porcentaje } = await request.json();

    // Buscamos los productos para saber su precio original
    const productos = await db.producto.findMany({
      where: { id_item: { in: ids } }
    });

    // Actualizamos uno por uno calculando el nuevo precio
    for (const prod of productos) {
      const descuentoValor = (Number(prod.price) * porcentaje) / 100;
      const nuevoPrecio = Number(prod.price) - descuentoValor;

      await db.producto.update({
        where: { id_item: prod.id_item },
        data: { discount_price: nuevoPrecio }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fallo al aplicar descuento" }, { status: 500 });
  }
}