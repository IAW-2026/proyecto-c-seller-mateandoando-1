// app/(dashboard)/nuevo/page.tsx
"use client"; 

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface Categoria {
  id_category: string;
  name: string;
}

export default function NuevoProductoPage() {
  // 1. Extraemos "trigger" para validar antes de avanzar de paso
  const { register, handleSubmit, setValue, getValues, trigger, formState: { errors } } = useForm();
  
  // 2. Estado para controlar la vista: empezamos en el paso 1
  const [paso, setPaso] = useState(1);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const { user, isLoaded } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

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

  // 3. Función que se ejecuta al apretar "Siguiente"
  const handleSiguiente = async () => {
    // Le pedimos a react-hook-form que valide SÓLO estos dos campos
    const esValido = await trigger(["name", "id_category"]);
    if (esValido) {
      setPaso(2); // Si está todo ok, mostramos el resto
    }
  };

  // 4. Esta función manda todo finalmente a tu API y Neon
  const onSubmit = async (data: any) => {
    const payloadCompleto = {
      ...data,
      id_seller: "seller123"
    };
    
    console.log("Datos armados listos para Neon:", payloadCompleto);

    try {
      // Reemplazá "/api/items" por la ruta exacta que armaste en tu contrato para POST de productos
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadCompleto),
      });

      if (!response.ok) {
        throw new Error("Falló la conexión con el servidor");
      }

      const productoCreado = await response.json();
      alert("¡Producto publicado con éxito en la Seller App!");
      console.log("Respuesta del servidor:", productoCreado);
      
      // Opcional: Podés redirigir al vendedor de vuelta a /productos acá

    } catch (error) {
      console.error("Error guardando el producto:", error);
      alert("Hubo un error al guardar el producto. Revisá la consola.");
    }
  };
const handleGenerarIA = async () => {
  setIsGenerating(true);
  try {
    // 1. Le pedimos a react-hook-form que nos dé los valores exactos en este milisegundo
    const nombreIngresado = getValues("name");
    const idCategoriaIngresada = getValues("id_category");

    // Validamos rápido que haya puesto un nombre antes de gastar un llamado a la IA
    if (!nombreIngresado) {
      alert("Por favor, escribí el nombre del producto primero.");
      setIsGenerating(false);
      return;
    }

    const response = await fetch("/api/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nombre: nombreIngresado, 
        // Buscamos el nombre de la categoría usando el ID que sacamos del formulario
        categoria: categorias.find(c => c.id_category === idCategoriaIngresada)?.name || "General" 
      }),
    });

    if (!response.ok) {
      // Si falla, leemos exactamente qué nos mandó el servidor
      const errorData = await response.json();
      throw new Error(`Detalle del servidor: ${errorData.error || errorData.message || "Desconocido"}`);
    }
    
    const data = await response.json();
    
    // Inyectamos el texto mágico en el textarea
    setValue("description", data.description, { shouldValidate: true });
    
  } catch (error) {
    alert("No se pudo generar la descripción ahora mismo.");
    console.error(error);
  } finally {
    setIsGenerating(false);
  }
};
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1B4332] mb-6">Añadir Nuevo Producto</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-md">
        
        {/* --- PASO 1: CAMPOS INICIALES --- */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nombre del Producto</label>
          <input 
            placeholder="Ej: Termo Stanley 1L" 
            {...register("name", { 
              required: "El nombre es obligatorio",
              minLength: { value: 3, message: "Debe tener al menos 3 caracteres" }
            })} 
            className={`p-2 rounded border ${errors.name ? "border-red-500" : "border-gray-300"}`}
            disabled={paso === 2} // Bloqueamos el input si ya pasó al paso 2
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message as string}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Categoría</label>
          <select 
            {...register("id_category", { required: "Debes elegir una categoría" })}
            className={`p-2 rounded border bg-white ${errors.id_category ? "border-red-500" : "border-gray-300"}`}
            disabled={paso === 2} // Bloqueamos el select si ya pasó al paso 2
          >
            <option value="">Seleccioná una categoría...</option>
            {categorias.map((cat) => (
              <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
            ))}
          </select>
          {errors.id_category && <span className="text-red-500 text-sm">{errors.id_category.message as string}</span>}
        </div>

        {/* Botón Siguiente: Solo se muestra si estamos en el paso 1 */}
        {paso === 1 && (
          <div className="flex flex-col gap-1 mt-2">
            <button
              type="button" // ¡Crucial! Si dice "submit" manda el formulario entero
              onClick={handleSiguiente}
              className="bg-[#1B4332] text-white py-2 px-4 rounded font-bold hover:bg-[#143325] transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* --- PASO 2: CAMPOS OCULTOS --- */}
        {paso === 2 && (
          <div className="flex flex-col gap-5 p-5 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Vendedor Autocompletado */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Vendedor Asociado</label>
              <input 
                disabled 
                value={isLoaded ? user?.fullName || user?.id : "Cargando..."}
                className="p-2 rounded border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
              />
              <span className="text-xs text-gray-500">Este campo se completa automáticamente con tu sesión.</span>
            </div>

            {/* Descripción con Botón de IA */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end mb-1">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <button 
                  type="button" 
                  onClick={handleGenerarIA}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? "Generando..." : "✨ Autocompletar con IA"}
                </button>
              </div>
              
              <textarea 
                placeholder="Detalla las características de tu producto..."
                rows={4}
                {...register("description", { 
                  required: "La descripción es obligatoria",
                  validate: (value) => {
                    const palabras = value.trim().split(/\s+/);
                    return palabras.length >= 5 || "La descripción debe tener al menos 5 palabras";
                  }
                })} 
                className={`p-2 rounded border ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && <span className="text-red-500 text-sm">{errors.description.message as string}</span>}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Precio (ARS)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input 
                  type="number"
                  placeholder="0.00" 
                  {...register("price", { 
                    required: "El precio es obligatorio",
                    valueAsNumber: true,
                    min: { value: 1, message: "El precio debe ser mayor a $1" }
                  })} 
                  className={`p-2 pl-7 rounded border w-full ${errors.price ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.price && <span className="text-red-500 text-sm">{errors.price.message as string}</span>}
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Stock Disponible</label>
              <input 
                type="number"
                placeholder="0" 
                {...register("stock", { 
                  required: "El stock es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "El stock debe ser un número positivo" }
                })} 
                className={`p-2 rounded border ${errors.stock ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.stock && <span className="text-red-500 text-sm">{errors.stock.message as string}</span>}
            </div>

            {/* Imagen con UploadThing */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Foto del Producto</label>

              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setValue("image_url", res[0].ufsUrl, { shouldValidate: true });
                  alert("¡Imagen subida con éxito!");
                }}
                onUploadError={(error: Error) => {
                  alert(`Error al subir: ${error.message}`);
                }}
              />

              <input type="hidden" {...register("image_url", { required: "Debes adjuntar una imagen" })} />
              {errors.image_url && <span className="text-red-500 text-sm">{errors.image_url.message as string}</span>}
            </div>

            {/* Botones de acción finales */}
            <div className="flex gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setPaso(1)} 
                className="w-1/3 bg-gray-200 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Atrás
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-[#1B4332] text-white p-3 rounded-lg font-bold cursor-pointer hover:bg-[#143325] transition-colors"
              >
                Publicar Producto
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}