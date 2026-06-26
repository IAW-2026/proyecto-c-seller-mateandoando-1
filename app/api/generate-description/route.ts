// app/api/generate-description/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inicializamos la IA con tu clave del .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { nombre, categoria } = await request.json();

    if (!nombre || !categoria) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Usamos el modelo Flash que es rapidísimo para textos cortos
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Acá le damos la instrucción exacta a la IA (el "Prompt")
    const prompt = `Actúa como un vendedor argentino simpático y experto en cultura matera. Escribe una descripción cálida y vendedora (máximo 40 palabras) para un producto llamado "${nombre}". La categoría del producto es "${categoria}". No uses emojis excesivos.`;

    const result = await model.generateContent(prompt);
    const textoGenerado = result.response.text();

    return NextResponse.json({ description: textoGenerado }, { status: 200 });

  }  catch (error: any) {
    console.error("Error completo de Gemini:", error);
    // Ahora mandamos el mensaje exacto que nos tira Google
    return NextResponse.json(
      { error: error.message || "Error desconocido" }, 
      { status: 500 }
    );
  }
}