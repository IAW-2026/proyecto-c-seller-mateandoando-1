// app/api/packages/[id_package]/delivered/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id_package: string }> }
) {
  try {
    const { id_package } = await params;
    
    // 1. Extraemos el JSON que nos manda la Shipping App en su webhook
    const body = await request.json();

    // 2. Capa de Seguridad: Validamos que quien llama sea realmente Shipping
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.SELLER_API_KEY; 

    if (!apiKey || apiKey !== validApiKey) {
      console.warn(`[Seguridad] Intento no autorizado en webhook de entrega para el paquete ${id_package}`);
      return NextResponse.json(
        { error: "Acceso denegado. API Key inválida o faltante." },
        { status: 401 }
      );
    }

    // 3. Verificamos que el contrato se respete y nos avisen de una ENTREGA
    if (body.status !== "ENTREGADO") {
      return NextResponse.json(
        { error: "Este endpoint solo procesa confirmaciones de entrega (status: ENTREGADO)." },
        { status: 400 }
      );
    }

    // 4. Actualizamos el paquete en nuestra base de datos local
    const paqueteActualizado = await db.paquete.update({
      where: { id_package: id_package },
      data: {
        status: body.status, // Guardamos "ENTREGADO"
        id_shipments: body.id_shipments // Sincronizamos el ID por las dudas
      },
    });

    console.log(`[WEBHOOK] ¡Éxito! Shipping confirmó la entrega del paquete: ${id_package}`);

    // 5. Le devolvemos el OK a Shipping para que no le salte el error en su consola
    return NextResponse.json(
      {
        message: "Estado actualizado correctamente en Seller App",
        id_package: paqueteActualizado.id_package,
        status: paqueteActualizado.status
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error crítico al recibir estado de Shipping:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la confirmación de entrega." },
      { status: 500 }
    );
  }
}