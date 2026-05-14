import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth(); // Verificamos que el usuario esté autenticado en el servidor

  return (
    <div className="bg-white rounded-lg border border-[#E5E2D9] p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-[#1B4332] mb-4 font-manrope">
        ¡Bienvenido a tu Tienda!
      </h1>
      <p className="text-[#414844] font-inter">
        Este es tu panel de control principal. Usa la barra lateral para administrar tu inventario, revisar tus ventas o publicar nuevos productos.
      </p>
      
      {/* Ejemplo de un dato que podrías cargar desde Prisma luego */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-[#e2f4c8] p-6 rounded border border-[#dcefc3]">
          <h3 className="text-sm font-semibold text-[#1B4332] uppercase">Ventas del mes</h3>
          <p className="text-2xl font-bold text-[#012d1d] mt-2">12</p>
        </div>
      </div>
    </div>
  );
}