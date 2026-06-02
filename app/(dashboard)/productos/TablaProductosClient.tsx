//app/(dashboard)/productos/TablaProductosClient.tsx
"use client";

import { useState} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductoToggle from "./ProductoToggle";
import {Pencil, X, BadgePercent} from "lucide-react";

export default function TablaProductosClient({ productosIniciales, currentPage, totalPages }: any) {
    const router = useRouter();
    const [seleccionados, setSeleccionados] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [porcentaje, setPorcentaje] = useState("");
    const [procesando, setProcesando] = useState(false);

    const toggleSeleccion = (id: string) => {
        setSeleccionados(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const seleccionarTodos = () => {
        // Solo tenemos en cuenta los productos que están activos
        const productosActivos = productosIniciales.filter((p: any) => p.is_active);
        
        if (seleccionados.length === productosActivos.length && productosActivos.length > 0) {
            setSeleccionados([]); // Deseleccionar todos
        } else {
            setSeleccionados(productosActivos.map((p: any) => p.id_item)); // Seleccionar solo los activos
        }
    };

    const aplicarDescuentoMasivo = async () => {
        if (!porcentaje || isNaN(Number(porcentaje))) return alert("Ingresá un número válido");
        
        setProcesando(true);
        try {
            const response = await fetch("/api/items/descuentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: seleccionados, porcentaje: Number(porcentaje) }),
            });

            if (!response.ok) throw new Error("Fallo al aplicar descuento");
            
            setShowModal(false);
            setSeleccionados([]);
            setPorcentaje("");
            router.refresh(); 
            
        } catch (error) {
            alert("Hubo un error al aplicar los descuentos.");
        } finally {
            setProcesando(false);
        }
    };

    const quitarDescuentoMasivo = async () => {
        if (!confirm("¿Seguro que querés quitar el descuento a los productos seleccionados?")) return;
        
        setProcesando(true);
        try {
            const response = await fetch("/api/items/descuentos/remover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: seleccionados }),
            });

            if (!response.ok) throw new Error("Fallo al quitar descuento");
            
            setSeleccionados([]);
            router.refresh(); 
            
        } catch (error) {
            alert("Hubo un error al quitar los descuentos.");
        } finally {
            setProcesando(false);
        }
    };

    //Verifica si es distinto de null, undefined y mayor a 0
    const haySeleccionadosConDescuento = productosIniciales.some(
        (prod: any) => seleccionados.includes(prod.id_item) && prod.discount_price
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-50 pb-4">
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    Inventario Actual <span className="text-sm font-normal text-slate-500 ml-2">(Pag {currentPage} de {totalPages})</span>
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {seleccionados.length > 0 && (
                        <div className="flex gap-2 w-full md:w-auto">
                            {haySeleccionadosConDescuento && (
                                <button 
                                    onClick={quitarDescuentoMasivo}
                                    disabled={procesando}
                                    className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors border border-red-100 flex-1 md:flex-none"
                                >
                                    <X size={16} className="mr-2" /> Quitar Descuento ({seleccionados.length})
                                </button>
                            )}
                            <button 
                                onClick={() => setShowModal(true)}
                                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors border border-indigo-100 flex-1 md:flex-none"
                            >
                                <BadgePercent size={16} className="mr-2" /> Descuento ({seleccionados.length})
                            </button>
                        </div>
                    )}
                    <Link 
                        href="/nuevo"
                        className="bg-[#1B4332] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#143325] transition-colors flex-1 md:flex-none text-center"
                    >
                        + Nuevo Producto
                    </Link>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Aplicar Descuento</h3>
                        <p className="text-sm text-slate-500 mb-4">Se aplicará a {seleccionados.length} producto(s).</p>
                        <div className="relative mb-6">
                            <input 
                                type="number" 
                                placeholder="Ej: 15"
                                value={porcentaje}
                                onChange={(e) => setPorcentaje(e.target.value)}
                                className="w-full p-3 pr-8 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                            <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                            <button onClick={aplicarDescuentoMasivo} disabled={procesando} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                {procesando ? "Aplicando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA PC */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 text-slate-500 text-sm tracking-wide">
                            <th className="py-3 px-4 w-12">
                                <input type="checkbox" onChange={seleccionarTodos} checked={seleccionados.length === productosIniciales.length && productosIniciales.length > 0} className="w-4 h-4 rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]" />
                            </th>
                            <th className="py-3 px-4 font-semibold uppercase">Producto</th>
                            <th className="py-3 px-4 font-semibold uppercase">Precio</th>
                            <th className="py-3 px-4 font-semibold uppercase">Stock</th>
                            <th className="py-3 px-4 font-semibold uppercase">Estado</th>
                            <th className="py-3 px-4 font-semibold uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosIniciales.map((prod: any) => (
                           <tr key={prod.id_item} className={`border-b border-gray-50 transition-colors ${!prod.is_active ? 'opacity-60 bg-gray-50' : seleccionados.includes(prod.id_item) ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                                <td className="py-4 px-4">
                                    <input 
                                        type="checkbox" 
                                        disabled={!prod.is_active || prod.stock <= 0} // <-- DESHABILITA SI ESTÁ PAUSADO O SIN STOCK
                                        checked={seleccionados.includes(prod.id_item)} 
                                        onChange={() => toggleSeleccion(prod.id_item)} 
                                        className="w-4 h-4 rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332] disabled:cursor-not-allowed" 
                                    />
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img src={prod.image_url} alt={prod.name} className="w-10 h-10 object-cover rounded-lg shadow-sm" />
                                        <div>
                                            <p className="font-bold text-slate-900">{prod.name}</p>
                                            <p className="text-xs text-slate-500">{prod.categoria.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {prod.discount_price ? (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 line-through">${prod.price.toLocaleString('es-AR')}</span>
                                            <span className="font-bold text-green-600">${prod.discount_price.toLocaleString('es-AR')}</span>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-[#1B4332]">${prod.price.toLocaleString('es-AR')}</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${prod.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {prod.stock} un.
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <ProductoToggle productoId={prod.id_item} estadoInicial={prod.is_active && prod.stock > 0} />
                                </td>
                                <td className="py-4 px-4 text-right">
                                    
                                    <Link href={`/productos/${prod.id_item}/editar`} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 inline-block" title="Modificar">
                                        <Pencil size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TARJETAS CELULAR */}
            <div className="md:hidden flex flex-col gap-4">
                {productosIniciales.map((prod: any) => (
                    <div key={prod.id_item} className={`border rounded-xl p-4 flex flex-col transition-shadow ${!prod.is_active ? 'opacity-60 bg-gray-50' : seleccionados.includes(prod.id_item) ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100 hover:shadow-md'}`}>
                        
                        {/* Parte superior: Foto, título, precio */}
                        <div className="flex gap-4 items-start">
                            <div className="mt-1">
                                <input 
                                    type="checkbox" 
                                    disabled={!prod.is_active} // <-- DESHABILITA SI ESTÁ PAUSADO
                                    checked={seleccionados.includes(prod.id_item)} 
                                    onChange={() => toggleSeleccion(prod.id_item)} 
                                    className="w-5 h-5 rounded border-gray-300 text-[#1B4332] disabled:cursor-not-allowed" 
                                />
                            </div>
                            <div className="w-16 h-16 shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 leading-tight truncate pr-2">{prod.name}</h3>
                                    <Link href={`/productos/${prod.id_item}/editar`} className="text-slate-400 hover:text-indigo-600 shrink-0 p-1">
                                        <Pencil size={16} />
                                    </Link>
                                </div>
                                <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
                                    {prod.discount_price ? (
                                        <div className="flex gap-1.5 items-center">
                                            <span className="text-xs text-slate-400 line-through">${prod.price}</span>
                                            <span className="font-bold text-green-600 text-lg leading-none">${prod.discount_price}</span>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-[#1B4332] text-lg leading-none">${prod.price}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Parte inferior: Estado y Stock */}
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                            <ProductoToggle productoId={prod.id_item} estadoInicial={prod.is_active && prod.stock > 0} />
                            
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${prod.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                Stock: {prod.stock}
                            </span>
                        </div>

                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50">
                <Link href={`?page=${currentPage - 1}`} className={`px-4 py-2 rounded-lg text-sm font-bold ${currentPage === 1 ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400' : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>← Anterior</Link>
                <span className="text-sm font-semibold text-slate-500">Pag {currentPage} / {totalPages}</span>
                <Link href={`?page=${currentPage + 1}`} className={`px-4 py-2 rounded-lg text-sm font-bold ${currentPage === totalPages ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400' : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>Siguiente →</Link>
            </div>
        </div>
    );
}