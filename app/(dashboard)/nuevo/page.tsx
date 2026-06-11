//app/(dashboard)/nuevo/page.tsx
"use client"; 

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {Sparkles, TriangleAlert, CircleCheckBig} from "lucide-react";

interface Categoria {
  id_category: string;
  name: string;
}

export default function NuevoProductoPage() {
  // Agregamos mode: "onBlur" para validar al salir del input
  const { register, handleSubmit, setValue, getValues, formState: { errors }, reset } = useForm({
    mode: "onBlur" 
  });
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { user, isLoaded } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagenSubida, setImagenSubida] = useState<string | null>(null);

  // ESTADO DEL TOAST (Notificación emergente)
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "success" });

  const mostrarToast = (mensaje: string, tipo: "success" | "error" = "success") => {
    setToast({ visible: true, mensaje, tipo });
    // Desaparece automáticamente a los 3.5 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Falló la carga de categorías");
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  const onSubmit = async (data: any) => {
    if (!user) {
      mostrarToast("Error: No estás logueado", "error");
      return;
    }
    const payloadCompleto = { ...data, id_seller: user.id };

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadCompleto),
      });
      
      if (!response.ok) throw new Error("Falló la conexión con el servidor");
      
      // MOSTRAMOS EL TOAST DE ÉXITO 
      mostrarToast("¡Producto publicado con éxito!");
      
      // Limpiamos el formulario para que pueda cargar otro
      reset();
      setImagenSubida(null);

    } catch (error) {
      // MOSTRAMOS EL TOAST DE ERROR
      mostrarToast("Hubo un error al guardar el producto", "error");
    }
  };

  const handleGenerarIA = async () => {
    setIsGenerating(true);
    try {
      const nombreIngresado = getValues("name");
      const idCategoriaIngresada = getValues("id_category");

      if (!nombreIngresado) {
        mostrarToast("Escribí el nombre del producto primero", "error");
        setIsGenerating(false);
        return;
      }

      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nombreIngresado, 
          categoria: categorias.find(c => c.id_category === idCategoriaIngresada)?.name || "General" 
        }),
      });

      if (!response.ok) throw new Error("Fallo al conectar con IA");
      const data = await response.json();
      setValue("description", data.description, { shouldValidate: true });
      mostrarToast("¡Descripción generada!");
    } catch (error) {
      mostrarToast("No se pudo generar la descripción", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl pb-12 relative">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Añadir Nuevo Producto
        </h1>
        <p className="text-slate-500 mt-2">Completa los detalles para publicar tu artículo en la tienda.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* BLOQUE 1: INFORMACIÓN PRINCIPAL */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-gray-50 pb-2">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Nombre del Producto</label>
              <input 
                placeholder="Ej: Termo Stanley 1L" 
                {...register("name", { required: "Obligatorio", minLength: 3 })} 
                className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none transition-all ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1B4332] focus:ring-[#1B4332]/20'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Categoría</label>
              <select 
                {...register("id_category", { required: "Obligatorio" })}
                className={`w-full p-3 rounded-xl border bg-white shadow-sm focus:ring-2 outline-none transition-all ${errors.id_category ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1B4332] focus:ring-[#1B4332]/20'}`}
              >
                <option value="">Seleccioná una categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between items-end mb-1">
              <label className="text-sm font-semibold text-slate-700">Descripción</label>
              <button 
                type="button" 
                onClick={handleGenerarIA}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generando..." : <Sparkles size={16} /> + " Autocompletar con IA"}
              </button>
            </div>
            <textarea 
              placeholder="Detalla las características de tu producto..."
              rows={4}
              {...register("description", { required: "Obligatorio" })} 
              className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none resize-none transition-all ${errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1B4332] focus:ring-[#1B4332]/20'}`}
            />
          </div>
        </div>

        {/* BLOQUE 2: PRECIO Y STOCK */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-gray-50 pb-2">Inventario y Precio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Precio de Venta (ARS)</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-500 font-medium">$</span>
                <input 
                  type="number"
                  step="0.01" // Permite decimales
                  placeholder="0.00"
                  {...register("price", { 
                    required: "Obligatorio", 
                    valueAsNumber: true,
                    min: { value: 0.01, message: "El precio debe ser mayor a 0" } // <-- VALIDACIÓN
                  })} 
                  className={`w-full p-3 pl-8 rounded-xl border shadow-sm focus:ring-2 outline-none transition-all ${errors.price ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1B4332] focus:ring-[#1B4332]/20'}`}
                />
              </div>
              {/* Mensaje de error dinámico */}
              {errors.price && <span className="text-red-500 text-xs font-medium ml-1">{errors.price.message as string}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Stock Disponible</label>
              <input 
                type="number"
                placeholder="Cantidad de unidades"
                {...register("stock", { 
                  required: "Obligatorio", 
                  valueAsNumber: true,
                  min: { value: 1, message: "El stock debe ser al menos 1 unidad" } // <-- VALIDACIÓN
                })} 
                className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none transition-all ${errors.stock ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#1B4332] focus:ring-[#1B4332]/20'}`}
              />
              {/* Mensaje de error dinámico */}
              {errors.stock && <span className="text-red-500 text-xs font-medium ml-1">{errors.stock.message as string}</span>}
            </div>
          </div>
        </div>

        {/* BLOQUE 3: MULTIMEDIA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-gray-50 pb-2">Multimedia</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Foto del Producto</label>
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${imagenSubida ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              
              {imagenSubida ? (
                <div className="text-center">
                  <span className="text-4xl block mb-2"><CircleCheckBig size={24} className="text-green-500" /></span>
                  <p className="text-sm font-bold text-green-700">¡Imagen subida correctamente!</p>
                </div>
              ) : (
                <UploadButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setValue("image_url", res[0].ufsUrl);
                    setImagenSubida(res[0].ufsUrl);
                  }}
                  onUploadError={(error) => mostrarToast(`Error: ${error.message}`, "error")}
                  appearance={{
                    button: "bg-white text-slate-700 border border-gray-200 shadow-sm hover:bg-gray-50 text-sm font-bold px-4 py-2 rounded-lg",
                    allowedContent: "text-xs text-gray-400 mt-2"
                  }}
                />
              )}
              
            </div>
            <input type="hidden" {...register("image_url", { required: "Obligatorio" })} />
          </div>
        </div>

        {/* BOTÓN FINAL */}
        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            className="w-full md:w-auto bg-[#1B4332] text-white py-3 px-8 rounded-xl font-bold text-lg hover:bg-[#143325] shadow-md transition-all active:scale-[0.98]"
          >
            Publicar Producto
          </button>
        </div>
      </form>

      {/* =========================================================
          COMPONENTE TOAST (Notificación Flotante)
      ========================================================= */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${
          toast.tipo === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-xl">
            {toast.tipo === "success" ? <Sparkles size={24} /> : <TriangleAlert size={24} />}
          </span>
          <p className="font-bold text-sm">{toast.mensaje}</p>
        </div>
      )}

    </div>
  );
}