import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ITEMS_PER_PAGE = 10;

export default async function ProductosPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
    // 1. Obtener el usuario autenticado
    const { userId } = await auth();
    
    if (!userId) {
        return <div>No autenticado</div>;
    }

    // 2. Buscar el vendedor en la BD por su clerk_user_id
    const vendedor = await db.vendedor.findUnique({
        where: { clerk_user_id: userId }
    });

    if (!vendedor) {
        return <div>Vendedor no encontrado</div>;
    }
    const searchParams = await props.searchParams;
    const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    // 3. Traer productos del VENDEDOR ACTUAL con paginación
    const [productos, totalProductos] = await Promise.all([
        db.producto.findMany({
            where: {
                id_seller: vendedor.id_seller  // ← FILTRO POR VENDEDOR
            },
            include: {
                categoria: true,
            },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        db.producto.count({
            where: {
                id_seller: vendedor.id_seller  // ← MISMO FILTRO
            }
        }),
    ]);

    const totalPages = Math.ceil(totalProductos / ITEMS_PER_PAGE);

    return (
        <div className="flex">
            <main className="flex-1 p-8 bg-[#F9F8F3]">
                <h1 className="text-3xl font-bold text-[#1B4332] mb-4 font-manrope">
                    Gestión de Productos
                </h1>
                
                <div className="bg-white rounded-lg border border-[#E5E2D9] p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1B4332] mb-4 text-center">
                        Inventario Actual (Página {currentPage} de {totalPages})
                    </h2>
                    
                    {productos.length === 0 ? (
                        <p className="text-[#414844] font-inter text-center">
                            Aún no tienes productos cargados.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                     <thead>
                                        <tr className="border-b border-[#E5E2D9] text-[#1B4332]">
                                            <th className="py-3 px-4 font-semibold">Producto</th>
                                            <th className="py-3 px-4 font-semibold">Categoría</th>
                                            <th className="py-3 px-4 font-semibold">Precio</th>
                                            <th className="py-3 px-4 font-semibold">Stock</th>
                                            <th className="py-3 px-4 font-semibold">Imagen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map((prod) => (
                                            <tr key={prod.id_item} className="border-b border-[#F1F0EA] hover:bg-[#F9F8F3] transition-colors">
                                                <td className="py-3 px-4 font-medium">{prod.name}</td>
                                                <td className="py-3 px-4 text-sm text-[#5C635E]">
                                                    {prod.categoria.name}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-[#1B4332]">
                                                    ${Number(prod.price).toLocaleString('es-AR')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {prod.stock} unidades
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <img src={prod.image_url} alt={prod.name} className="w-16 h-16 object-cover rounded" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Controles de paginación */}
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <a 
                                    href={`?page=${currentPage - 1}`} // ← Enlace para la página anterior
                                    className={`px-4 py-2 rounded border ${
                                        currentPage === 1
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                            : 'bg-[#1B4332] text-white hover:bg-[#0F2C1F]'
                                    }`}
                                    aria-disabled={currentPage === 1}
                                >
                                    ← Anterior
                                </a>
                                
                                <span className="px-4 py-2 font-semibold text-[#1B4332]">
                                    Página {currentPage} de {totalPages}
                                </span>
                                
                                <a 
                                    href={`?page=${currentPage + 1}`} // ← Enlace para la página siguiente
                                    className={`px-4 py-2 rounded border ${
                                        currentPage === totalPages
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                            : 'bg-[#1B4332] text-white hover:bg-[#0F2C1F]'
                                    }`}
                                    aria-disabled={currentPage === totalPages}
                                >
                                    Siguiente →
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}