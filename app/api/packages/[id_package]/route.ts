//app/api/packages/[id_package]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  // 1. ACÁ ESTÁ EL CAMBIO PRINCIPAL: Le decimos a TS que espere id_package
  { params }: { params: Promise<{ id_package: string }> } 
) {
  try {
    // 2. Extraemos id_package en lugar de id
    const { id_package } = await params; 
    const datosRecibidos = await request.json();
    console.log("SHIPPING_URL:", process.env.SHIPPING_URL);
    console.log("NEXT_PUBLIC_SHIPPING_URL:", process.env.NEXT_PUBLIC_SHIPPING_URL);
    console.log("SHIPPING_API_KEY:", process.env.SHIPPING_API_KEY ? "✅ presente" : "❌ undefined");
    // 3. Usamos id_package en la URL de Lola
    const resShipping = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/${id_package}/dispatch`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": process.env.SHIPPING_API_KEY as string 
      },
      body: JSON.stringify({
        id_package: id_package, // 4. Mandamos el id_package en el body
        carrier_name: datosRecibidos.carrier_name,
        address_snapshot: datosRecibidos.address_snapshot,
        shipping_cost: datosRecibidos.shipping_cost,
        id_user: datosRecibidos.id_buyer
      })
    });

    if (!resShipping.ok) {
      const errorData = await resShipping.json().catch(() => ({}));
      console.error("Fallo la API de Shipping:", errorData);
      return NextResponse.json(
        { error: "El servicio de envíos no pudo procesar la etiqueta", details: errorData }, 
        { status: resShipping.status }
      );
    }

    const dataShipping = await resShipping.json();
    const codigoSeguimiento = dataShipping.id_shipment || dataShipping.id_shipments;

    // 5. Usamos id_package en nuestra base de datos local
    const paqueteActualizado = await db.paquete.update({
      where: { id_package: id_package }, 
      data: {
        status: "RETIRADO",
        id_shipments: codigoSeguimiento
      }, 
    });

    return NextResponse.json(paqueteActualizado, { status: 200 });

  } catch (error) {
    console.error("Error crítico en la integración:", error);
    return NextResponse.json(
      { error: "Error de sistema al despachar. Intente nuevamente." }, 
      { status: 500 }
    );
  }
}