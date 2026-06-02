//app/api/items/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Leemos TODO lo que nos manda el formulario (nombre, precio, foto, is_active, etc)
    const body = await request.json();

    const productoActualizado = await db.producto.update({
      where: { id_item: id },
      data: body, // <--- Pasamos todo el objeto directamente
    });

    return NextResponse.json(productoActualizado, { status: 200 });

  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 }
    );
  }
}