import { NextResponse } from 'next/server';
import { getCategories } from '@/services/category.service';

export async function GET() {
  try {
    // Llamamos al servicio que creamos para obtener las categorías ordenadas alfabéticamente
    const categories = await getCategories();
    
    // Devolvemos la información en formato JSON con un código de éxito 200
    return NextResponse.json(categories, { status: 200 });

  } catch (error) {
    console.error("Error obteniendo las categorías:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al buscar categorías" },
      { status: 500 }
    );
  }
}