// app/api/purchase-orders/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  // 1. Le avisamos a TypeScript el nombre real de la carpeta
  { params }: { params: Promise<{ id_purchase_order: string }> } 
) {
  const apiKey = request.headers.get("X-API-Key");
  
  if (apiKey !== process.env.PAYMENTS_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Extraemos el valor usando el nombre correcto
    const { id_purchase_order } = await params; 
    const body = await request.json();
    
    const ordenActualizada = await db.ordenCompra.update({
      where: { 
        // 3. Se lo pasamos a Prisma
        id_purchase_order: id_purchase_order 
      },
      data: {
        status: body.status, 
        id_payment_operation: body.id_payment_operation 
      }
    });

    await db.paquete.updateMany({
      where: { 
        id_purchase_order: id_purchase_order 
      },
      data: { 
        status: "PREPARADO" 
      }
    });
    
    return NextResponse.json({
      id_purchase_order: ordenActualizada.id_purchase_order,
      status: ordenActualizada.status,
      packages_status: "PREPARADO"
    });
  } catch (error) {
    console.error("Error actualizando el pago:", error);
    return NextResponse.json({ error: "Error interno al actualizar la base de datos" }, { status: 500 });
  }
}