//app/api/buyers/[id_buyer]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<any> } // Dejamos que acepte cualquier nombre de parámetro
) {
  const resolvedParams = await params;
  
  try {
    const idComprador = Object.values(resolvedParams)[0] as string;

    console.log("=== DIAGNÓSTICO PROXY SELLER ===");
    console.log("ID detectado con éxito:", idComprador);
    
    const apiKey = process.env.BUYER_API_KEY;

    if (!apiKey) {
      console.error("CRÍTICO: Falta configurar BUYER_API_KEY en las variables de entorno.");
      return NextResponse.json({ error: "Error de configuración interna" }, { status: 500 });
    }

    // Ahora la URL se va a armar con el ID real y no con "undefined"
    const urlDestino = `${process.env.NEXT_PUBLIC_BUYER_URL}/api/buyers/${idComprador}`;
    console.log("Fetch real hacia Buyer App:", urlDestino);

    const response = await fetch(urlDestino, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey 
      }
    });

    if (!response.ok) {
      const errorTexto = await response.text().catch(() => "No se pudo leer el cuerpo del texto");
      console.error(`Buyer App respondió con error ${response.status}:`, errorTexto);
      return NextResponse.json({ error: "Fallo al consultar la Buyer App" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error en proxy:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}