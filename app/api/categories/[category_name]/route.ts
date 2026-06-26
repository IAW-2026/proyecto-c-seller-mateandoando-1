// app/api/categories/[category_name]/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. Definimos la interfaz para tipar los parámetros dinámicos con TypeScript
interface RouteParams {
  params: Promise<{
    category_name: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams // 2. Recibimos las params como segundo argumento
) {
  try {
    const { category_name } = await params;

    if (!category_name) {
      return NextResponse.json(
        { error: "Falta el parámetro category_name" },
        { status: 400 }
      );
    }

    // 4. Buscamos los productos en Neon filtrando por el NOMBRE de la categoría
    // Nota: Como la Buyer App manda "termos" o "mates", filtramos por categoria.name
    const productos = await db.producto.findMany({
      where: {
        categoria: {
          name: {
            equals: category_name,
            mode: "insensitive", // Esto hace que "Termos", "termos" o "TERMOS" funcionen igual
          },
        },
      },
      include: {
        categoria: true,
        vendedor: true,
      },
    });
    const formattedItems = productos.map((item) => {
     // 1. Convertimos los Decimal de Prisma a Number para poder hacer matemática
      const priceNum = Number(item.price);
      const discountPriceNum = item.discount_price ? Number(item.discount_price) : null;
      
      // 2. Calculamos el porcentaje (si tiene precio de descuento y es menor al original)
      let discount_percentage = 0;
      if (discountPriceNum && discountPriceNum < priceNum) {
        discount_percentage = Math.round(((priceNum - discountPriceNum) / priceNum) * 100);
      }
    return {
      id_item: item.id_item, // Usamos el nombre del campo ID de tu esquema
      name: item.name,
      price: item.price,
      image_url: item.image_url, // Lo incluimos para que la Buyer App pueda mostrar la foto
      id_category: item.id_category,
      category_name: item.categoria.name,
      id_seller: item.id_seller,
      seller_name: item.vendedor.name,
      discount_percentage: discount_percentage
    };
  });
  return NextResponse.json(formattedItems);

  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}