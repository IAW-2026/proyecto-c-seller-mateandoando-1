// app/api/purchase-orders/route.ts
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

import { Producto, Vendedor, EstadoOrden, EstadoPaquete} from "@prisma/client";

type ItemGroup = {
  producto: Producto & { vendedor: Vendedor };
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_buyer, id_buyer_app, items, zip_code, address_snapshot } = body; 

    // Validación
    if (!id_buyer || !items || !Array.isArray(items) || items.length === 0 || !zip_code || !address_snapshot) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Consultamos el costo de envío antes de armar los totales
    let shippingCost = 5000; // Valor por defecto en caso de fallo con la Shipping App
    let carrierName = "Correo Argentino"; // Valor por defecto

    try {
      // Extraemos la clave de entorno de forma segura
      const shippingApiKey = process.env.SHIPPING_API_KEY;

      if (!shippingApiKey) {
        throw new Error("Falta configurar SHIPPING_API_KEY en las variables de entorno");
      }

      const shippingResponse = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_URL}/api/shippings/cost`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-API-Key": shippingApiKey 
        },
        //  Usamos la key exacta de la api
        body: JSON.stringify({ destination_zip_code: Number(zip_code) })
      });

      if (!shippingResponse.ok) {
        throw new Error("No se pudo obtener tarifa de Shipping App");
      }

      const shippingData = await shippingResponse.json();
      
      //  Usamos las keys exactas de la api
      shippingCost = Number(shippingData.cost_package);
      carrierName = shippingData.carrier_name; 

    } catch (error) {
      console.error("Error al consultar Shipping App:", error);
      return NextResponse.json(
        { error: "Error calculando costos de envío con logística" },
        { status: 500 }
      );
    } 
    

    // ------------------------------------------

    // PASO 0: Sanitizar y Agrupar el Carrito
    // Esto salva las papas si el frontend (Gonzalo) manda ítems repetidos sin agrupar
    const itemsAgrupadosMap = new Map<string, number>();
    
    for (const item of items) {
      const cantidad = Number(item.quantity);
      if (isNaN(cantidad) || cantidad <= 0) continue; // Filtramos basura

      if (itemsAgrupadosMap.has(item.id_item)) {
        // Si ya existe, le sumamos la cantidad
        itemsAgrupadosMap.set(item.id_item, itemsAgrupadosMap.get(item.id_item)! + cantidad);
      } else {
        // Si es nuevo, lo registramos
        itemsAgrupadosMap.set(item.id_item, cantidad);
      }
    }

    // Convertimos el mapa de vuelta al formato del contrato [{ id_item, quantity }]
    const itemsProcesados = Array.from(itemsAgrupadosMap.entries()).map(([id_item, quantity]) => ({
      id_item,
      quantity
    }));

    // Súper importante: A partir de acá, usamos 'itemsProcesados' en todo tu código
    // Reemplazá 'for (const item of items)' por 'for (const item of itemsProcesados)' en tus bucles

    // Obtener información de todos los productos y agrupar por vendedor
    const productosMap = new Map<string, ItemGroup[]>();
    for (const item of itemsProcesados) {
      const producto = await db.producto.findUnique({
        where: { id_item: item.id_item },
        include: { vendedor: true },
      });

      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.id_item} no encontrado` },
          { status: 404 }
        );
      }
      
      const cantidadPedida = item.quantity;
      const cantidadActual = producto.stock;
      
      console.log("=== CONTROL DE INVENTARIO ===");
      console.log(`Producto: ${producto.name}`);
      console.log(`Cantidad Solicitada: ${cantidadPedida} (Tipo: ${typeof cantidadPedida})`);
      console.log(`Stock en Base de Datos: ${cantidadActual} (Tipo: ${typeof cantidadActual})`);
      console.log("=============================");

      // Si por alguna razón la conversión falla o da un número inválido
      if (isNaN(cantidadPedida) || cantidadPedida <= 0) {
        return NextResponse.json(
          { error: `La cantidad enviada para el producto ${producto.name} es inválida.` },
          { status: 400 }
        );
      }

      // Validación estricta de stock
      if (cantidadPedida > cantidadActual) {
        console.log("❌ STOCK INSUFICIENTE: Bloqueando creación de orden.");
        return NextResponse.json(
          { error: `Stock insuficiente para el producto "${producto.name}". Solicitado: ${cantidadPedida}, Disponible: ${cantidadActual}` },
          { status: 400 }
        );
      }

      if (!productosMap.has(producto.id_seller)) {
        productosMap.set(producto.id_seller, []);
      }

      const grupo = productosMap.get(producto.id_seller)!;
      grupo.push({
        producto,
        quantity: item.quantity,
      });  
    }
    
    // Crear los paquetes agrupados por vendedor
    const paquetesData: any[] = [];
    let totalPrice = 0;

    for (const [id_seller, items_grupo] of productosMap) {
      const sumaProductos = items_grupo.reduce<number>((sum, item) => {
        const precioLista = Number(item.producto.price);
        // Si hay un precio de descuento, lo usamos. Si no, precio normal.
        const precioVentaFinal = item.producto.discount_price ? Number(item.producto.discount_price) : precioLista;
        
        return sum + (precioVentaFinal * item.quantity);
      }, 0);

      
      // El precio del paquete es Productos (con descuento) + Envío
      const precioPackageRaw = sumaProductos + shippingCost;
      const precioPackage = Number(precioPackageRaw.toFixed(2)); 
      totalPrice += precioPackage;

      paquetesData.push({
        id_seller_app: id_buyer_app || "buyer-app-default", 
        price_package: precioPackage,
        shipping_cost: shippingCost, // Guardamos el costo logístico
        carrier_name: carrierName,   // Guardamos el correo
        status: EstadoPaquete.PENDIENTE,
        vendedor: { connect: { id_seller: id_seller } }, 
        articulos: {
          create: items_grupo.map((item) => {
            // Calcular el precio unitario con descuento para guardarlo en la tabla intermedia
            const precioLista = Number(item.producto.price);
            const precioVentaFinal = item.producto.discount_price ? Number(item.producto.discount_price) : precioLista;
            return {
              quantity: item.quantity,
              sale_price: Number(precioVentaFinal.toFixed(2)), // Guardamos el precio promocional exacto en la BD
              producto: { connect: { id_item: item.producto.id_item } },
            };
          }),
        },
      });
      // ------------------------------------------
    }

    // PASO 3: Transacción de Base de Datos (Operación Atómica BLINDADA)
    try {
      const nuevaOrden = await db.$transaction(async (tx) => {
        
        // A. Descontamos el stock con un ESCUDO a nivel Base de Datos
        for (const item of itemsProcesados) {
          const cantidadPedida = Number(item.quantity);

          // updateMany busca el producto PERO solo lo actualiza si el stock le alcanza
          const actualizacion = await tx.producto.updateMany({
            where: { 
              id_item: item.id_item,
              stock: {
                gte: cantidadPedida // SÚPER ESCUDO: Stock actual debe ser Mayor o Igual a lo pedido
              }
            },
            data: {
              stock: {
                decrement: cantidadPedida,
              },
            },
          });

          // Si actualizacion.count es 0, significa que no encontró el producto o NO TENÍA STOCK
          if (actualizacion.count === 0) {
            // Tirar este error rompe la transacción y deshace cualquier cambio previo
            throw new Error(`STOCK_ERROR_${item.id_item}`); 
          }
        }

        // B. Creamos la orden de compra junto con los paquetes enlazados
        return await tx.ordenCompra.create({
          data: {
            id_buyer,
            id_buyer_app: id_buyer_app || "buyer-app-default", 
            total_price: Number(totalPrice.toFixed(2)),
            status: "CREADA",
            zip_code,
            address_snapshot,
            paquetes: {
              create: paquetesData, 
            },
          },
          include: { paquetes: true },
        });
      });

      // Estructura de respuesta limpia para la Buyer App según contrato
      const response = {
        id_purchase_order: nuevaOrden.id_purchase_order,
        total_price: Number(nuevaOrden.total_price),
        status: nuevaOrden.status,
        packages: nuevaOrden.paquetes.map((pkg) => ({
          id_package: pkg.id_package,
          id_seller: pkg.id_seller,
        })),
        zip_code: nuevaOrden.zip_code,
        address_snapshot: nuevaOrden.address_snapshot
      };

      return NextResponse.json(response, { status: 201 });

    } catch (error: any) {
      // C. Atajamos nuestro error personalizado de stock para devolver un 400 limpio
      if (error.message && error.message.includes('STOCK_ERROR')) {
        return NextResponse.json(
          { error: "Error de inventario: Uno o más productos de la orden superan el stock disponible. La compra fue rechazada." },
          { status: 400 }
        );
      }
      
      console.error("Error creando la orden:", error);
      return NextResponse.json(
        { error: "Error interno del servidor al crear la orden" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creando la orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la orden" },
      { status: 500 }
    );
  }
}