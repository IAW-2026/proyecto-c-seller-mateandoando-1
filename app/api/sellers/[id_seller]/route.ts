// app/api/sellers/[id_seller]/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";


// 1. Definimos la interfaz para tipar los parámetros dinámicos con TypeScript
interface RouteParams {
  params: Promise<{
    id_seller: string;
  }>;
}


export async function GET(
  request: Request,
  { params }: RouteParams // 2. Recibimos las params como segundo argumento
) {
  try {
    const {id_seller } = await params;

    if (!id_seller) {
      return NextResponse.json(
        { error: "Falta el parámetro id_seller" },
        { status: 400 }
      );
    }

    // 4. Buscamos el vendedor específico en Neon filtrando por el id_seller
    const vendedor = await db.vendedor.findUnique({
      where: {
        id_seller: id_seller,
      },
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: "Vendedor no encontrado" },
        { status: 404 }
      );
    }
    // 5. Mapeamos el resultado para cumplir con contrato 03-apis.md
    const formattedItems = {
        id_seller: vendedor.id_seller,
        name: vendedor.name,
        address: vendedor.address,
        rating: vendedor.rating,  
        sales_made: vendedor.sales_made,
    }

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error("Error al obtener el vendedor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}