// app/api/purchase-orders/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

import { Producto, Vendedor, EstadoOrden, EstadoPaquete} from "@prisma/client";

type ItemGroup = {
  producto: Producto & { vendedor: Vendedor };
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_buyer, id_buyer_app, items, zip_code, address_snapshot } = body; 

    // Validación
    if (!id_buyer || !items || !Array.isArray(items) || items.length === 0 || !zip_code || !address_snapshot) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Consultamos el costo de envío antes de armar los totales
    let shippingCost = 5000; // Valor por defecto en caso de fallo con la Shipping App
    let carrierName = "Correo Argentino"; // Valor por defecto

    try {
      // Extraemos la clave de entorno de forma segura
      const shippingApiKey = process.env.SHIPPING_API_KEY;

      if (!shippingApiKey) {
        throw new Error("Falta configurar SHIPPING_API_KEY en las variables de entorno");
      }

      const shippingResponse = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/cost`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": shippingApiKey 
        },
        //  Usamos la key exacta de la api
        body: JSON.stringify({ destination_zip_code: Number(zip_code) })
      });

      if (!shippingResponse.ok) {
        throw new Error("No se pudo obtener tarifa de Shipping App");
      }

      const shippingData = await shippingResponse.json();
      
      //  Usamos las keys exactas de la api
      shippingCost = Number(shippingData.cost_package);
      carrierName = shippingData.carrier_name; 

    } catch (error) {
      console.error("Error al consultar Shipping App:", error);
      return NextResponse.json(
        { error: "Error calculando costos de envío con logística" },
        { status: 500 }
      );
    } 
    

    // ------------------------------------------

    // Obtener información de todos los productos y agrupar por vendedor
    const productosMap = new Map<string, ItemGroup[]>();
    for (const item of items) {
      const producto = await db.producto.findUnique({
        where: { id_item: item.id_item },
        include: { vendedor: true },
      });

      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.id_item} no encontrado` },
          { status: 404 }
        );
      }

      if (!productosMap.has(producto.id_seller)) {
        productosMap.set(producto.id_seller, []);
      }
      
      const grupo = productosMap.get(producto.id_seller)!;
      grupo.push({
        producto,
        quantity: item.quantity,
      });
    }

    // Crear los paquetes agrupados por vendedor
    const paquetesData = [];
    let totalPrice = 0;

    for (const [id_seller, items_grupo] of productosMap) {
      const sumaProductos = items_grupo.reduce<number>((sum, item) => {
        const precioLista = Number(item.producto.price);
        // Si hay un precio de descuento, lo usamos. Si no, precio normal.
        const precioVentaFinal = item.producto.discount_price ? Number(item.producto.discount_price) : precioLista;
        
        return sum + (precioVentaFinal * item.quantity);
      }, 0);

      
      // El precio del paquete es Productos (con descuento) + Envío
      const precioPackageRaw = sumaProductos + shippingCost;
      const precioPackage = Number(precioPackageRaw.toFixed(2)); 
      totalPrice += precioPackage;

      paquetesData.push({
        id_seller_app: id_buyer_app || "buyer-app-default", 
        price_package: precioPackage,
        shipping_cost: shippingCost, // Guardamos el costo logístico
        carrier_name: carrierName,   // Guardamos el correo
        status: EstadoPaquete.PENDIENTE,
        vendedor: { connect: { id_seller: id_seller } }, 
        articulos: {
          create: items_grupo.map((item) => {
            // Calcular el precio unitario con descuento para guardarlo en la tabla intermedia
            const precioLista = Number(item.producto.price);
            const precioVentaFinal = item.producto.discount_price ? Number(item.producto.discount_price) : precioLista;
            return {
              quantity: item.quantity,
              sale_price: Number(precioVentaFinal.toFixed(2)), // Guardamos el precio promocional exacto en la BD
              producto: { connect: { id_item: item.producto.id_item } },
            };
          }),
        },
      });
      // ------------------------------------------
    }

    const nuevaOrden = await db.ordenCompra.create({
      data: {
        id_buyer,
        id_buyer_app: id_buyer_app || "buyer-app-default", 
        total_price: Number(totalPrice.toFixed(2)),
        status: "CREADA",
        zip_code,
        address_snapshot,
        paquetes: {
          create: paquetesData, 
        },
      },
      include: { paquetes: true },
    });

    //-------------------------------------------
    const response = {
      id_purchase_order: nuevaOrden.id_purchase_order,
      total_price: Number(nuevaOrden.total_price),
      status: nuevaOrden.status,
      packages: nuevaOrden.paquetes.map((pkg) => ({
        id_package: pkg.id_package,
        id_seller: pkg.id_seller,
      })),
      zip_code: nuevaOrden.zip_code,
      address_snapshot: nuevaOrden.address_snapshot
    };
    // ------------------------------------------

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("Error creando la orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la orden" },
      { status: 500 }
    );
  }
}