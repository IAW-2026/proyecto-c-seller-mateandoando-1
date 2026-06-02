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
      },
    });

    // 5. Mapeamos el resultado para cumplir con contrato 03-apis.md
    const formattedItems = productos.map((item) => ({
      id_item: item.id_item,
      name: item.name,
      price: item.price,
      stock: item.stock,
      image_url: item.image_url,
      id_seller: item.id_seller,
    }));

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}