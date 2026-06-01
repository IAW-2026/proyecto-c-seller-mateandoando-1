import { PrismaClient, EstadoOrden, EstadoPaquete } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la carga de datos (Seed)...');

  // ==========================================
  // 1. CARGAR CATEGORÍAS (De forma segura)
  // ==========================================
  console.log('📦 Cargando categorías...');
  const categoriasNombres = ['mates', 'termos', 'bombillas', 'yerberas', 'canastas', 'combos'];
  const categoriasMap = new Map(); // Para guardar los IDs y usarlos en los productos
  
  for (const nombre of categoriasNombres) {
    let categoria = await prisma.categoria.findFirst({ where: { name: nombre } });
    
    if (!categoria) {
      categoria = await prisma.categoria.create({ data: { name: nombre } });
      console.log(`  ➕ Categoría creada: ${categoria.name}`);
    }
    categoriasMap.set(nombre, categoria);
  }

  // ==========================================
  // 2. CREAR VENDEDOR
  // ==========================================
  console.log('👤 Configurando Vendedor...');
  
  // AHORA: Usá tu correo de prueba local
  const emailVendedor = 'guadanayla1101@gmail.com'; 
  
  // AHORA: Pegá el ID largo de tu Clerk Development
  const idClerk = 'user_3DiqOum7deWSCv7RWZxEALa1pkK'; 

  const emailVendedor2 = 'guadanayla1101+tomas@gmail.com'; 
  const idClerk2 = 'user_3Drxbo4Hlqo2sBm6Fu4YQypRInv'; 

  let vendedorApp2 = await prisma.vendedor.findFirst({ where: { email: emailVendedor2 } });
  if (!vendedorApp2) {
    vendedorApp2 = await prisma.vendedor.create({
      data: {
        email: emailVendedor2,
        clerk_user_id: idClerk2,
        name: 'El Rey del Termo',
        address: 'Chiclana 500, Bahía Blanca', 
      }
    });
  }
  // PARA LA ENTREGA: Comentá las dos líneas de arriba y descomentá estas dos de abajo
  // const emailVendedor = 'seller+clerktest@iaw.com';
  // const idClerk = 'user_prod_REEMPLAZAR_POR_ID_REAL';

  let vendedorApp = await prisma.vendedor.findFirst({
    where: { email: emailVendedor } 
  });

  if (!vendedorApp) {
    vendedorApp = await prisma.vendedor.create({
      data: {
        email: emailVendedor,
        clerk_user_id: idClerk, 
        name: 'Usuario Vendedor',
        address: 'Calle Falsa 123, Ciudad',
        sales_made: 0,
        rating: 0
      }
    });
    console.log(`  ➕ Vendedor creado con ID: ${vendedorApp.id_seller}`);
  } else {
    console.log('  ✔️ El Vendedor ya existe.');
  }

  // ==========================================
  // 3. CARGAR PRODUCTOS DEL CATÁLOGO
  // ==========================================
  console.log('🧉 Cargando productos al catálogo...');
  
  const matesCategory = categoriasMap.get('mates');
  const termosCategory = categoriasMap.get('termos');
  const bombillasCategory = categoriasMap.get('bombillas');
  const yerberasCategory = categoriasMap.get('yerberas');
  const canastasCategory = categoriasMap.get('canastas');
  const combosCategory = categoriasMap.get('combos');

  const productosSemilla = [
    {
      name: 'Mate Imperial Premium - Cuero Negro',
      description: 'Mate de calabaza forrado en cuero vacuno negro con virola de alpargata cincelada a mano.',
      price: 45000,
      stock: 12,
      is_active: true,
      id_category: matesCategory.id_category, 
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqwmnXnUq1RjT53iFgvlp6efUzSc9qnNKsyubt'
    },
    {
      name: 'Mate Torpedo - Marrón Clásico',
      description: 'Mate torpedo uruguayo de calabaza gruesa, virola lisa de acero inoxidable.',
      price: 32000,
      stock: 5,
      is_active: true,
      id_category: matesCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqVymONo45ykavKJ2UcTYh9ZwuWjrDR4oEztx6'
    },
    {
      name: 'Termo Stanley Classic 1 Litro',
      description: 'El clásico termo verde que mantiene el agua caliente por 24hs. Con manija.',
      price: 110000,
      stock: 8,
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedorApp2.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqaB9K1beyIeC64rzHRPDMNLwapxbclTU7itK2'
    },
    {
      name: 'Termo Media Manija 1L - Acero',
      description: 'Termo de acero inoxidable con pico cebador de precisión. Ideal para viajes.',
      price: 45000,
      stock: 0, // Ponemos uno sin stock para que el profe vea cómo se maneja en tu app
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqTIM0pMtLimNWlcd0Dv95CPUspZtbwfEOHoyG'
    },
    {
      name: 'Bombilla Pico de Loro - Acero Inoxidable',
      description: 'Bombilla de acero inoxidable con filtro tipo pico de loro, ideal para evitar que pasen restos de yerba.',
      price: 3500,
      stock: 20,
      is_active: true,
      id_category: bombillasCategory.id_category,
      id_seller: vendedorApp2.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqjftKUii2I2FZTDVnutlW4gq6LXUPaQNEdSkJ'
    },
    {
      name: 'Yerbera de Madera - 500g',
      description: 'Yerbera de madera maciza con tapa hermética, capacidad para 500 gramos de yerba.',
      price: 2500,
      stock: 15,
      is_active: true,
      id_category: yerberasCategory.id_category,
      id_seller: vendedorApp2.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqlYTRaAikbUdRgsEyi9WTcrXjaZ40FIBKClw6'
    },
    {
      name: 'Canasta Matera Completa',
      description: 'Canasta de mimbre con mate, termo, bombilla y yerbera. El regalo perfecto para los amantes del mate.',
      price: 15000,
      stock: 5,
      is_active: true,
      id_category: canastasCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqMOOXlI4yGUKND3ZcipVyFtQuXhSLs9mfa5YT'
    },
    {
      name: 'Combo Mate y Termo - Descuento Especial',
      description: 'Combo que incluye un mate imperial premium y un termo media manija con un 15% de descuento.',
      price: 90000,
      discount_price:76500,
      stock: 3,
      is_active: true,
      id_category: combosCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriq67fGCIkeElavomAwVb2Lr6xOijQMStJYygsH'
    },
    {
      name: 'Combo Bombilla y Yerbera - Oferta',
      description: 'Combo con bombilla pico de loro y yerbera de madera a un precio especial.',
      price: 5000,
      stock: 10,
      is_active: true,
      id_category: combosCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriq5zjH7LDVt1SxAXiJZ4NlFBRQCI8jdqsH7akT'
    },
    {
      name: 'Mate de Vidrio con Funda - Edición Limitada',
      description: 'Mate de vidrio resistente con funda de neopreno, ideal para llevar tu mate a todas partes.',
      price: 40000,
      stock: 5,
      is_active: true,
      id_category: matesCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqXmSO1kiuQMuaYgpfB6S0RDGtFTbe9xrnKkCv'
    },
    {
      name: 'Termo Eléctrico Portátil - 1 Litro',
      description: 'Termo eléctrico portátil que calienta el agua en minutos, perfecto para viajes o la oficina.',
      price: 120000,
      stock: 3,
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedorApp2.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqOSNlVC0bKqNzTviyEAuH15rLfD6psXWwGgxd'
    },
    {
      name: 'Bombilla de Alpaca - Diseño Exclusivo',
      description: 'Bombilla de alpaca con diseño exclusivo y filtro de malla fina, ideal para un mate suave.',
      price: 8000,
      stock: 10,
      is_active: true,
      id_category: bombillasCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqTun52AtLimNWlcd0Dv95CPUspZtbwfEOHoyG'
    },
    {
      name: 'Yerbera de Cerámica - 1kg',
      description: 'Yerbera de cerámica con tapa hermética, capacidad para 1 kilogramo de yerba.',
      price: 4000,
      stock: 15,
      is_active: true,
      id_category: yerberasCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqYDe4pScF4z9jZwr2UYDnNlRouSJvV3QsmcgB'
    }
  ];

  for (const prod of productosSemilla) {
    const existe = await prisma.producto.findFirst({ where: { name: prod.name } });
    
    if (!existe) {
      await prisma.producto.create({ data: prod });
      console.log(`  ➕ Producto creado: ${prod.name}`);
    } else {
      // NUEVO: Si ya existe, pisamos los datos viejos con los nuevos (ej: las fotos)
      await prisma.producto.update({
        where: { id_item: existe.id_item }, 
        data: prod
      });
      console.log(`  🔄 Producto actualizado: ${prod.name}`);
    }
  }
  // ==========================================
  // 4. CARGAR ÓRDENES DE COMPRA (Pruebas con matemáticas exactas)
  // ==========================================
  console.log('🛍️ Generando órdenes de compra de prueba...');

  const mateImperialV1 = await prisma.producto.findFirst({ where: { name: 'Mate Imperial Premium - Cuero Negro' } });
  const termoStanleyV2 = await prisma.producto.findFirst({ where: { name: 'Termo Stanley Classic 1 Litro' } });

  if (mateImperialV1 && termoStanleyV2) {
    // Convertimos los Decimals a números de JS para poder hacer matemática
    const precioMate = Number(mateImperialV1.price);
    const precioTermo = Number(termoStanleyV2.price);
    //----------Calculos para las ordenes-------------
    const envioOrden1 = 1000;
    const itemsOrden1 = precioMate * 1; 
    const totalPaquete1 = itemsOrden1 + envioOrden1; 

    const envioOrden2 = 2500;
    const itemsOrden2 = precioTermo * 1; 
    const totalPaquete2 = itemsOrden2 + envioOrden2; 

    const envioOrden3 = 1500;
    const itemsOrden3 = (precioMate * 1) + (precioTermo * 1); 
    const totalPaquete3 = itemsOrden3 + envioOrden3; 
    //-----------------------------------------------------------------
    const ordenesPrueba = [
      {
        id_purchase_order: 'ORD-TEST-001',
        id_buyer: 'buyer_test_777', 
        id_buyer_app: 'app_buyer_iaw', 
        total_price: totalPaquete1, 
        status: EstadoOrden.PAGADA, 
        id_payment_operation: 'mp_test_123456',
        paquetes: {
          create: [{
            id_seller_app: 'app_seller_iaw', 
            id_seller: vendedorApp.id_seller,
            status: EstadoPaquete.PREPARADO, 
            shipping_cost: envioOrden1,
            price_package: totalPaquete1, 
            articulos: {
              create: [{
                id_item: mateImperialV1.id_item, 
                quantity: 1,
                sale_price: precioMate 
              }]
            }
          }]
        }
      },
      {
        id_purchase_order: 'ORD-TEST-002',
        id_buyer: 'buyer_test_888',
        id_buyer_app: 'app_buyer_iaw',
        total_price: totalPaquete2,
        status: EstadoOrden.PAGADA,
        id_payment_operation: 'mp_test_789012',
        paquetes: {
          create: [{
            id_seller_app: 'app_seller_iaw',
            id_seller: vendedorApp.id_seller,
            status: EstadoPaquete.ENTREGADO,
            carrier_name: 'Andreani', 
            shipping_cost: envioOrden2,
            price_package: totalPaquete2,
            id_shipments: 'track_and_9999', 
            articulos: {
              create: [{
                id_item: termoStanleyV2.id_item,
                quantity: 1,
                sale_price: precioTermo
              }]
            }
          }]
        }
      },
      {
        id_purchase_order: 'ORD-TEST-003',
        id_buyer: 'buyer_test_999',
        id_buyer_app: 'app_buyer_iaw',
        total_price: totalPaquete3,
        status: EstadoOrden.CANCELADA, 
        id_payment_operation: 'mp_test_refunded',
        paquetes: {
          create: [{
            id_seller_app: 'app_seller_iaw',
            id_seller: vendedorApp.id_seller,
            status: EstadoPaquete.CANCELADO,
            shipping_cost: envioOrden3,
            price_package: totalPaquete3,
            articulos: {
              create: [
                { id_item: mateImperialV1.id_item, quantity: 1, sale_price: precioMate },
                { id_item: termoStanleyV2.id_item, quantity: 1, sale_price: precioTermo }
              ]
            }
          }]
        }
      }
    ];

    for (const orden of ordenesPrueba) {
      const existeOrden = await prisma.ordenCompra.findUnique({ 
        where: { id_purchase_order: orden.id_purchase_order } 
      });
      
      if (!existeOrden) {
        await prisma.ordenCompra.create({ data: orden });
        console.log(`  ➕ Orden creada: ${orden.id_purchase_order}`);
      } else {
        await prisma.ordenCompra.update({
          where: { id_purchase_order: orden.id_purchase_order },
          data: orden
        });
        console.log(`  🔄 Orden actualizada: ${orden.id_purchase_order}`);
      }
    }
  }
  console.log('✅ ¡Base de datos poblada con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });