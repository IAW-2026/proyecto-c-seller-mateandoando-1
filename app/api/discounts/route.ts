// app/api/discounts/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { discount_percentage } = body;

    // Validación según los nombres de tu esquema
    if (!discount_percentage || typeof discount_percentage !== "number" || discount_percentage <= 0 || discount_percentage >= 100) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el valor no es válido" },
        { status: 400 }
      );
    }

    // Usamos db.producto (según tu esquema)
    // 1. Buscamos TODOS los productos que tengan un precio de descuento cargado
    const productos = await db.producto.findMany({
      where: {
        discount_price: { not: null }, // Descartamos los que no están en oferta
      }
    });
    // 2. Filtramos con JavaScript aplicando lógica matemática
    const productosPromo = productos.filter((item) => {
      // Convertimos los Decimal de Prisma a números normales para hacer matemática
      const precioOriginal = Number(item.price);
      const precioDescuento = Number(item.discount_price);

      // Calculamos qué porcentaje de descuento real tiene este producto
      const porcentajeReal = ((precioOriginal - precioDescuento) / precioOriginal) * 100;

      // Dejamos pasar solo los que cumplan con el descuento.
      // Usamos Math.round para evitar problemas de decimales (ej: 19.999999%)
      return Math.round(porcentajeReal) >= discount_percentage;
    });
        if (productosPromo.length === 0) {
        return NextResponse.json(
          { message: "No se encontraron productos con ese descuento" },
          { status: 404 }
        );
      }

    // Mapeo para cumplir con el contrato 03-apis.md (id_item)
    const formattedItems = productosPromo.map((item) => ({
      id_item: item.id_item, // Usamos el nombre del campo ID de tu esquema
      name: item.name,
      price: item.price,
      discount_price: item.discount_price,
      image_url: item.image_url, // Lo incluimos para que la Buyer App pueda mostrar la foto
    }));
    
    return NextResponse.json(
      { message: "Productos encontrados con éxito", data: formattedItems },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error buscando productos con descuento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al buscar productos con descuento" },
      { status: 500 }
    );
  }
}