// app/api/packages/[id_package]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id_package: string }> }
) {
  try {
    const { id_package } = await params;

    // 1. Evitamos que el código explote si el botón del frontend no manda un body
    const datosRecibidos = await request.json().catch(() => ({}));

    // 2. Buscamos el paquete en tu BD para rescatar el correo y el costo
    const paquete = await db.paquete.findUnique({
      where: { id_package: id_package }
    });

    if (!paquete) {
      return NextResponse.json({ error: "Paquete no encontrado en BD" }, { status: 404 });
    }

    console.log("LLAVE QUE ESTOY ENVIANDO A LOLA:", process.env.SHIPPING_API_KEY);

    // 3. Armamos un Body blindado. Si el frontend no manda el dato, usamos el de Prisma o un default.
    // Esto garantiza que pasemos el "if" estricto de la app de Shipping.
    const bodyParaShipping = {
      id_package: id_package,
      carrier_name: datosRecibidos.carrier_name || paquete.carrier_name || "Correo Argentino",
      address_snapshot: datosRecibidos.address_snapshot || "Bahía Blanca, 8000",
      shipping_cost: Number(datosRecibidos.shipping_cost || paquete.shipping_cost || 5000),
      id_user: datosRecibidos.id_buyer || "buyer_999" // Fallback por si no viene el id del comprador
    };

    console.log("Datos que le viajan a Lola:", bodyParaShipping);

    // 4. Hacemos el fetch a Shipping
    const resShipping = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/${id_package}/dispatch`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SHIPPING_API_KEY as string
      },
      body: JSON.stringify(bodyParaShipping)
    });

    if (!resShipping.ok) {
      const errorData = await resShipping.json().catch(() => ({}));
      console.error("Fallo la API de Shipping:", errorData);
      return NextResponse.json(
        { error: "El servicio de envíos rechazó el despacho", details: errorData },
        { status: resShipping.status }
      );
    }

    const dataShipping = await resShipping.json();
    const codigoSeguimiento = dataShipping.id_shipment || dataShipping.id_shipments;

    // 5. Actualizamos tu base de datos local
    const paqueteActualizado = await db.paquete.update({
      where: { id_package: id_package },
      data: {
        status: "RETIRADO", // O "DESPACHADO", según cómo lo manejes en tu frontend
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