import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const datosRecibidos = await request.json();
    const apiKey = process.env.SHIPPING_API_KEY;
    console.log("===============================");
    console.log("¿QUÉ ESTOY MANDANDO A SHIPPING?");
    console.log("Llave:", apiKey);
    console.log("===============================");

    // 1. Hablamos con Shipping desde EL SERVIDOR
    const resShipping = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/${id}/dispatch`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": process.env.SHIPPING_API_KEY as string 
      },
      body: JSON.stringify({
        id_package: id, 
        carrier_name: datosRecibidos.carrier_name,
        address_snapshot: datosRecibidos.address_snapshot,
        shipping_cost: datosRecibidos.shipping_cost,
        id_user: datosRecibidos.id_buyer
      })
    });

    // 2. Si la API falla, abortamos antes de tocar nuestra Base de Datos
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

    // 3. Solo si la API respondió OK, actualizamos nuestro estado local
    const paqueteActualizado = await db.paquete.update({
      where: { id_package: id },
      data: {
        status: "RETIRADO",
        id_shipments: codigoSeguimiento
      }, 
    });

    return NextResponse.json(paqueteActualizado, { status: 200 });

  } catch (error) {
    // Si ocurre un error inesperado (ej: fallo de red), notificamos al vendedor
    console.error("Error crítico en la integración:", error);
    return NextResponse.json(
      { error: "Error de sistema al despachar. Intente nuevamente." }, 
      { status: 500 }
    );
  }
}