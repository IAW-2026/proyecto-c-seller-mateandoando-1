// app/api/categories/[category_name]/[id_item]/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";


// 1. Definimos la interfaz para tipar los parámetros dinámicos con TypeScript
interface RouteParams {
  params: Promise<{
    category_name: string;
    id_item: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams // 2. Recibimos las params como segundo argumento
) {
  try {
    const { category_name, id_item } = await params;

    if (!category_name) {
      return NextResponse.json(
        { error: "Falta el parámetro category_name" },
        { status: 400 }
      );
    }
    if (!id_item) {
      return NextResponse.json(
        { error: "Falta el parámetro id_item" },
        { status: 400 }
      );
    }

    // 4. Buscamos el producto específico en Neon filtrando por el NOMBRE de la categoría y el id_item
    // Nota: Como la Buyer App manda "termos" o "mates", filtramos por categoria.name
    const producto = await db.producto.findUnique({
      where: {
        categoria: {// 1. Metete a la tabla Categoria
          name: { // 2. Buscá en la columna "name" de esa tabla
            equals: category_name, // 3. Que sea igual a lo que viene en la URL
            mode: "insensitive", // Esto hace que "Termos", "termos" o "TERMOS" funcionen igual
          },
        },
        id_item: id_item, // Filtramos por el id_item específico
      },
      include: {  
        categoria: true,
        vendedor: true,
      }, /*Hacé el viaje a Neon y traeme el producto, pero de paso enganchá 
      también toda la información del vendedor y de la categoría asociados en una sola consulta*/
    });
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    // 5. Mapeamos el resultado para cumplir con contrato 03-apis.md
    const formattedItems = {
      id_item: producto.id_item,
      name: producto.name,
      description: producto.description,
      price: producto.price,
      stock: producto.stock,
      id_category: producto.id_category,
      seller: {
        id: producto.id_seller,
        name: producto.vendedor.name,
        rating: producto.vendedor.rating,
      },
      image_url: producto.image_url,
    };

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error("Error al obtener el producto de la categoría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}