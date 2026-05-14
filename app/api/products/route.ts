import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importamos el cliente único que creamos

export async function POST(request: Request) {
  try {
    // 1. Extraer los datos enviados en el "cuerpo" (body) de la petición
    const body = await request.json();
    const { name, description, price, stock, id_category, id_seller } = body;

    // 2. Validación básica para que no rompa la base de datos
    if (!name || !price || !id_category || !id_seller) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 } // Error de cliente (Bad Request)
      );
    }

    // 3. Crear el producto en Neon usando Prisma
    const nuevoProducto = await prisma.producto.create({
      data: {
        name,
        description: description || "", // Si no envían descripción, queda vacía
        price,
        stock: stock || 0,
        id_category,
        id_seller,
      },
    });

    // 4. Devolver respuesta de éxito al cliente
    return NextResponse.json(
      { message: "Producto creado con éxito", data: nuevoProducto },
      { status: 201 } // Status 201 significa "Creado"
    );

  } catch (error) {
    console.error("Error creando el producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear el producto" },
      { status: 500 }
    );
  }
}