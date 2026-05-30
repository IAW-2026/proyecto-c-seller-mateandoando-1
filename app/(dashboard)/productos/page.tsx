//app/(dashboard)/productos/page.tsx

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import TablaProductosClient from "./TablaProductosClient";

const ITEMS_PER_PAGE = 10;

export default async function ProductosPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
    const { userId } = await auth();
    if (!userId) return <div className="p-8 text-red-500">No autenticado</div>;

    const vendedor = await db.vendedor.findUnique({
        where: { clerk_user_id: userId }
    });
    if (!vendedor) return <div className="p-8 text-red-500">Vendedor no encontrado</div>;
    
    const searchParams = await props.searchParams;
    const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const [productos, totalProductos] = await Promise.all([
        db.producto.findMany({
            where: { id_seller: vendedor.id_seller },
            include: { categoria: true },
            skip,
            take: ITEMS_PER_PAGE,
            orderBy: { name: 'asc' }
        }),
        db.producto.count({ where: { id_seller: vendedor.id_seller } }),
    ]);

    // Limpiamos los decimales de Prisma para que React los entienda perfectamente
    const productosLimpios = productos.map(p => ({
        ...p,
        price: Number(p.price),
        discount_price: p.discount_price ? Number(p.discount_price) : null
    }));

    const totalPages = Math.ceil(totalProductos / ITEMS_PER_PAGE);

    return (
        <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8">
                Gestión de Productos
            </h1>
            <TablaProductosClient 
                productosIniciales={productosLimpios} 
                currentPage={currentPage} 
                totalPages={totalPages} 
            />
        </div>
    );
}