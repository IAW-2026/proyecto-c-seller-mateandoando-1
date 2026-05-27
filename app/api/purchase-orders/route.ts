// app/api/purchase-orders/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

import type { Producto, Vendedor, EstadoOrden, EstadoPaquete} from "@prisma/client";

type ItemGroup = {
  producto: Producto & { vendedor: Vendedor };
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Aseguramos extraer id_buyer_app del body
    const { id_buyer, id_buyer_app, items } = body; 

    // Validación
    if (!id_buyer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

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
      
      // Usamos el "!" para garantizar que existe
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
      const precioPackageRaw = items_grupo.reduce<number>(
        (sum, item) => sum + Number(item.producto.price) * item.quantity,
        0
      );

      // Forzamos a que tenga solo 2 decimales de precisión
      const precioPackage = Number(precioPackageRaw.toFixed(2)); 
      totalPrice += precioPackage;

      paquetesData.push({
        id_seller_app: id_buyer_app || "buyer-app-default", 
        price_package: precioPackage,
        vendedor: { connect: { id_seller: id_seller } }, 
        articulos: {
          create: items_grupo.map((item) => ({
            quantity: item.quantity,
            sale_price: item.producto.price,
            producto: { connect: { id_item: item.producto.id_item } },
          })),
        },
      });
    }

    const nuevaOrden = await db.ordenCompra.create({
      data: {
        id_buyer,
        id_buyer_app: id_buyer_app || "buyer-app-default", 
        total_price: totalPrice,
        status: "CREADA",
        paquetes: {
          create: paquetesData, 
        },
      },
      include: { paquetes: true },
    });

    const response = {
      id_purchase_order: nuevaOrden.id_purchase_order,
      total_price: Number(nuevaOrden.total_price),
      status: nuevaOrden.status,
      packages: nuevaOrden.paquetes.map((pkg) => ({
        id_package: pkg.id_package,
        id_seller: pkg.id_seller,
      })),
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("Error creando la orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la orden" },
      { status: 500 }
    );
  }
}

