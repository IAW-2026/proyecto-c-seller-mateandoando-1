// app/api/payments/[id_payment_operation]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id_payment_operation: string }> }
) {
  try {
    const { id_payment_operation } = await params;

    // 1. Buscamos las credenciales en tu archivo .env
    const paymentsUrl = process.env.NEXT_PUBLIC_PAYMENTS_URL; // ej: https://payments-app.vercel.app
    const apiKey = process.env.PAYMENTS_API_KEY;      // La llave que acordaron

    if (!paymentsUrl || !apiKey) {
      console.error("Faltan variables de entorno de Payments");
      return NextResponse.json(
        { error: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    // 2. Hacemos la consulta segura de servidor a servidor
    const response = await fetch(`${paymentsUrl}/api/payments/transactions/${id_payment_operation}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Asegurate de que este sea el nombre exacto del header que acordaron
        "x-api-key": apiKey 
      },
      // Usamos cache: "no-store" para asegurarnos de traer la info en tiempo real siempre
      cache: "no-store" 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("La Payments App devolvió error:", errorData);
      return NextResponse.json(
        { error: "No se pudo obtener el detalle del pago desde el servidor." },
        { status: response.status }
      );
    }

    // 3. Devolvemos los datos de la transacción al frontend
    const transactionData = await response.json();
    return NextResponse.json(transactionData, { status: 200 });

  } catch (error) {
    console.error("Error crítico al consultar pago:", error);
    return NextResponse.json(
      { error: "Error interno al intentar conectar con Pagos." },
      { status: 500 }
    );
  }
}