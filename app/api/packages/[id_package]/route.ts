import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  // Usamos el nombre exacto de la carpeta [id_package]
  { params }: { params: Promise<{ id_package: string }> } 
) {
  try {
    const { id_package } = await params;
    
    // Leemos qué nos manda el frontend (status y id_shipments)
    const body = await request.json(); 
    
    const paqueteActualizado = await db.paquete.update({
      where: { 
        id_package: id_package 
      },
      data: {
        status: body.status, 
        id_shipments: body.id_shipments // Guardamos el código de seguimiento
      }
    });

    return NextResponse.json(paqueteActualizado);
    
  } catch (error) {
    console.error("Error actualizando el paquete localmente:", error);
    return NextResponse.json(
      { error: "Error interno al guardar en la base de datos" }, 
      { status: 500 }
    );
  }
}