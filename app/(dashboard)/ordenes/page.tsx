// app/(dashboard)/ordenes/page.tsx
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ButtonOrden from "./ButtonOrden";

export const dynamic = "force-dynamic"; // Apagamos el caché por las dudas

export default async function OrdenesPage() {
  // 1. Obtenemos el ID de Clerk (ej: user_2n...)
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Buscamos a este usuario en nuestra tabla de Vendedores
  const vendedorActual = await db.vendedor.findFirst({
    where: {
      clerk_user_id: userId 
    }
  });

  if (!vendedorActual) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1B4332] mb-6">Mis Órdenes</h1>
        <p>Error: Tu usuario de Clerk no está registrado en la tabla de Vendedores.</p>
      </div>
    );
  }

  // 3. Ahora sí, buscamos las órdenes usando el ID INTERNO correcto
  const misOrdenes = await db.ordenCompra.findMany({
    where: {
      paquetes: {
        some: {
          id_seller: vendedorActual.id_seller, // Usamos el ID interno
        },
      },
    },
    include: {
      paquetes: {
        where: {
          id_seller: vendedorActual.id_seller,
        },
      },
    },
    orderBy: {
      created_at: 'desc' 
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1B4332] mb-6">Mis Órdenes de Compra</h1>
      
      {misOrdenes.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600">Aún no tenés ninguna orden registrada.</p>
        </div>
      ) : (
        misOrdenes.map((orden) => {
          // 1. "Limpiamos" los decimales raros de Prisma transformándolos a números de JS
          const ordenParaCliente = {
            ...orden,
            total_price: Number(orden.total_price),
            paquetes: orden.paquetes.map(paquete => ({
              ...paquete,
              price_package: Number(paquete.price_package),
              shipping_cost: Number(paquete.shipping_cost)
            }))
          };

          return (
            <div key={orden.id_purchase_order} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">ORDEN DE COMPRA</p>
                  <p className="text-xl font-bold text-gray-800">{orden.id_purchase_order}</p>
                  <p className="text-xs text-gray-400 mt-1">Paquete: {orden.paquetes[0].id_package}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {orden.paquetes[0].status}
                  </span>
                  {/* Acá ya podemos usar el número limpio sin problemas */}
                  <p className="text-lg font-bold text-[#1B4332] mt-1">${Number(orden.paquetes[0].price_package)}</p>
                </div>
              </div>

              {/* 2. Le pasamos la orden limpia al Componente de Cliente */}
              <ButtonOrden ordenActiva={ordenParaCliente} />
            </div>
          );
        })
      )}
    </div>
  );
}