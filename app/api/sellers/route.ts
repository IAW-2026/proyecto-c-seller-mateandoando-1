// app/api/sellers/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
try {
    // Obtenemos los vendedores directamente desde Prisma, ordenados alfabéticamente
    const sellers = await prisma.vendedor.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Devolvemos la información en formato JSON con un código de éxito 200
    return NextResponse.json(sellers, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo los vendedores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al buscar vendedores" },
      { status: 500 }
    );
  }
}