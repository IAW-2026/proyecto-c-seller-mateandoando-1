//app/(dashboard)/productos/[id]/editar/page.tsx
import db from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditarForm from "./EditarForm";

export default async function EditarProductoPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    
    // 1. Buscamos el producto en la base de datos
    const producto = await db.producto.findUnique({
        where: { id_item: params.id }
    });

    if (!producto) {
        redirect("/productos");
    }

    // 2. LIMPIEZA TOTAL: Convertimos TODOS los objetos Decimal de Prisma a números normales
    const productoLimpio = {
        ...producto,
        price: Number(producto.price),
        discount_price: producto.discount_price ? Number(producto.discount_price) : null,
    };

    return (
        <div className="w-full max-w-3xl pb-12 relative">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                    Editar Producto
                </h1>
                <p className="text-slate-500 mt-2">Modificá los detalles de tu artículo.</p>
            </div>
            
            {/* 3. Ahora sí pasamos un objeto 100% limpio y compatible */}
            <EditarForm producto={productoLimpio} />
        </div>
    );
}