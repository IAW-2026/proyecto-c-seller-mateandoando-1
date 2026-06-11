// app/api/items/route.ts
import db from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, id_category, id_seller, image_url } = body;

    // Validación según los nombres de tu esquema
    if (!name || !price || !id_category || !id_seller) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }
    const vendedorActual = await db.vendedor.findFirst({
      where: { clerk_user_id: id_seller }
    });

    // Validamos por seguridad que el vendedor exista en nuestra BDD
    if (!vendedorActual) {
      return NextResponse.json(
        { error: "El usuario no está registrado como vendedor" },
        { status: 404 }
      );
    }
    // Usamos db.producto (según tu esquema)
    const nuevoProducto = await db.producto.create({
      data: {
        name,
        description: description || "",
        price,
        stock: stock || 0,
        id_category, // Referencia al id_category de tu modelo Categoria
        id_seller: vendedorActual.id_seller,   // Referencia al id_seller de tu modelo Vendedor
        image_url: image_url || null, // Guardamos la URL si viene en la petición
      },
    });

    return NextResponse.json(
      { message: "Producto creado con éxito", data: nuevoProducto },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creando el producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el producto" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Usamos db.producto e incluimos las relaciones según tu esquema
    const productos = await db.producto.findMany({
      include: {
        categoria: true, // Nombre de la relación en tu modelo Producto
        vendedor: true,  // Nombre de la relación en tu modelo Producto
      },
    });

    // Mapeo para cumplir con el contrato 03-apis.md (id_item)
    const formattedItems = productos.map((item) => ({
      id_item: item.id_item, // Usamos el nombre del campo ID de tu esquema
      name: item.name,
      price: item.price,
      image_url: item.image_url, // Lo incluimos para que la Buyer App pueda mostrar la foto
      id_category: item.id_category,
      id_seller: item.id_seller,
    }));

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error("Error obteniendo los productos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener los productos" },
      { status: 500 }
    );
  }
}