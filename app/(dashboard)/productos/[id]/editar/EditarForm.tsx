//app/(dashboard)/productos/[id]/editar/EditarForm.tsx
"use client"; 

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {Sparkles, TriangleAlert} from "lucide-react";

export default function EditarForm({ producto }: { producto: any }) {
  const router = useRouter();
  
  // Le inyectamos los valores actuales del producto para que los inputs se llenen solos
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: producto.name,
      id_category: producto.id_category,
      description: producto.description,
      price: producto.price,
      stock: producto.stock,
      image_url: producto.image_url
    }
  });
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagenSubida, setImagenSubida] = useState<string | null>(producto.image_url); // Inicia con la foto vieja
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "success" });

  const mostrarToast = (mensaje: string, tipo: "success" | "error" = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategorias(data);
        // Le recordamos al formulario cuál era la categoría original para que el select se sincronice bien
        setValue("id_category", producto.id_category);
      });
  }, [producto.id_category, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/items/${producto.id_item}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Falló la conexión con el servidor");
      
      mostrarToast("¡Producto actualizado con éxito!");
      
      // Esperamos 1 segundo y medio para que lea el toast, y lo mandamos de vuelta al inventario
      setTimeout(() => {
        router.push("/productos");
        router.refresh();
      }, 1500);

    } catch (error) {
      mostrarToast("Hubo un error al guardar los cambios", "error");
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
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* BLOQUE 1: INFORMACIÓN PRINCIPAL */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-gray-50 pb-2">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Nombre del Producto</label>
              <input {...register("name", { required: "Obligatorio", minLength: 3 })} className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-[#1B4332]'}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Categoría</label>
              <select {...register("id_category", { required: "Obligatorio" })} className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none ${errors.id_category ? 'border-red-400' : 'border-gray-200 focus:border-[#1B4332]'}`}>
                {/* Agregamos el placeholder invisible */}
                <option value="" disabled>Seleccioná una categoría...</option>
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
                <input type="number" step="0.01" {...register("price", { required: "Obligatorio", valueAsNumber: true, min: 0.01 })} className="w-full p-3 pl-8 rounded-xl border shadow-sm focus:ring-2 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Stock Disponible</label>
              <input type="number" {...register("stock", { required: "Obligatorio", valueAsNumber: true, min: 1 })} className="w-full p-3 rounded-xl border shadow-sm focus:ring-2 outline-none" />
            </div>
          </div>
        </div>

        {/* BLOQUE 3: MULTIMEDIA */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-gray-50 pb-2">Multimedia</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Foto del Producto</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50">
              
              {/* Mostramos la foto actual para que el usuario sepa qué está editando */}
              {imagenSubida && (
                <div className="mb-4">
                  <img src={imagenSubida} alt="Producto" className="w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200" />
                </div>
              )}

              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setValue("image_url", res[0].ufsUrl);
                  setImagenSubida(res[0].ufsUrl);
                }}
                onUploadError={(error) => mostrarToast(`Error: ${error.message}`, "error")}
                appearance={{ button: "bg-white text-slate-700 border border-gray-200 shadow-sm text-sm font-bold px-4 py-2 rounded-lg" }}
              />
            </div>
            <input type="hidden" {...register("image_url", { required: "Obligatorio" })} />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/productos')} className="w-full md:w-auto bg-white text-slate-700 border border-gray-200 py-3 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">Cancelar</button>
          <button type="submit" className="w-full md:w-auto bg-[#1B4332] text-white py-3 px-8 rounded-xl font-bold text-lg hover:bg-[#143325] shadow-md transition-all">Guardar Cambios</button>
        </div>
      </form>

      {/* TOAST DE NOTIFICACIÓN */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 ${toast.tipo === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span className="text-xl">{toast.tipo === "success" ? <Sparkles size={24} /> : <TriangleAlert size={24} />}</span>
          <p className="font-bold text-sm">{toast.mensaje}</p>
        </div>
      )}
    </>
  );
}