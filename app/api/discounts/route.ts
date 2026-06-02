// seller-app/app/api/discounts/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Leemos exactamente el nombre que manda el contrato
    const { min_discount_percentage } = body;

    // Validación actualizada
    if (!min_discount_percentage || typeof min_discount_percentage !== "number" || min_discount_percentage <= 0 || min_discount_percentage >= 100) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el valor no es válido" },
        { status: 400 }
      );
    }

    const productos = await db.producto.findMany({
      where: {
        discount_price: { not: null }, 
      }
    });

    const productosPromo = productos.filter((item) => {
      const precioOriginal = Number(item.price);
      const precioDescuento = Number(item.discount_price);

      const porcentajeReal = ((precioOriginal - precioDescuento) / precioOriginal) * 100;

      // Comparamos contra la variable correcta
      return Math.round(porcentajeReal) >= min_discount_percentage;
    });

    if (productosPromo.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron productos con ese descuento", data: [] }, // Siempre es buena práctica devolver la data vacía en listas
        { status: 404 }
      );
    }

    const formattedItems = productosPromo.map((item) => ({
      id_item: item.id_item,
      name: item.name,
      price: Number(item.price), // Limpiamos el Decimal de Prisma por las dudas
      discount_price: Number(item.discount_price),
      image_url: item.image_url, 
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