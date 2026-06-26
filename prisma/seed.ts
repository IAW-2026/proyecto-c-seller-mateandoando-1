import { PrismaClient, EstadoOrden, EstadoPaquete } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { randomUUID } from 'crypto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

// Función para generar fechas aleatorias en los últimos 40 días (Time Travel)
function getRandomDateInLastMonth() {
  const hoy = new Date();
  const fechaPasada = new Date();
  fechaPasada.setDate(hoy.getDate() - 40); 
  return new Date(fechaPasada.getTime() + Math.random() * (hoy.getTime() - fechaPasada.getTime()));
}

async function main() {
  console.log('🌱 Iniciando la carga de datos dinámica y no destructiva...');

  // ==========================================
  // 1. CARGAR CATEGORÍAS
  // ==========================================
  console.log('📦 Sincronizando categorías...');
  const categoriasNombres = ['mates', 'termos', 'bombillas', 'yerberas', 'canastas', 'combos'];
  const categoriasMap = new Map<string, string>(); // Guarda el par: Name -> id_category autogenerado
  
  for (const nombre of categoriasNombres) {
    let categoria = await prisma.categoria.findFirst({ where: { name: nombre } });
    
    if (!categoria) {
      categoria = await prisma.categoria.create({ data: { name: nombre } });
      console.log(`  ➕ Categoría creada automáticamente: ${categoria.name}`);
    }
    categoriasMap.set(nombre, categoria.id_category);
  }

  // ==========================================
  // 2. CARGAR VENDEDORES
  // ==========================================
  console.log('👥 Sincronizando Vendedores...');
  
  const vendedoresData = [
    {
      email: 'seller+clerk_test@iaw.com',
      clerk_user_id: 'user_3EYFA7wDLmgUdEgEgROVBkYqXuI', 
      name: 'Usuario Vendedor',
      address: 'Calle Falsa 123, Ciudad',
      sales_made: 0,
      rating: 4
    },
    {
      email: 'ventasartesaniassur@iaw.com',
      clerk_user_id: 'user_3Fdq7snbj5DxxzfA4csyvC5BaRD', 
      name: 'Artesanías Sur',
      address: 'Av. Alem 1253, Bahía Blanca',
      sales_made: 0,
      rating: 4
    },
    {
      email: 'contactoelrey@iaw.com',
      clerk_user_id: 'user_3FdqCmVcrmUxtYF00N8Nz4RUGnf', 
      name: 'El Rey del Termo',
      address: 'Chiclana 500, Bahía Blanca',
      sales_made: 0,
      rating: 4
    }
  ];

  const vendedoresMap = new Map<string, string>(); // Guarda el par: Name -> id_seller autogenerado

  for (const vData of vendedoresData) {
    let vendedor = await prisma.vendedor.findFirst({ where: { email: vData.email } });

    if (!vendedor) {
      vendedor = await prisma.vendedor.create({ data: vData });
      console.log(`  ➕ Vendedor creado con ID autogenerado: ${vendedor.name}`);
    } else {
      console.log(`  ✔️ Vendedor existente detectado: ${vendedor.name} (ID retenido)`);
    }
    vendedoresMap.set(vendedor.name, vendedor.id_seller);
  }

  // Capturamos el ID dinámico de tu usuario principal para las órdenes del final
  const idSellerPrincipal = vendedoresMap.get('Usuario Vendedor')!;

  // ==========================================
  // 3. CARGAR PRODUCTOS DEL CATÁLOGO
  // ==========================================
  console.log('🧉 Sincronizando productos...');
  
  const productosSemilla = [
    // Vendedor 1 (Tu usuario)
    {
      name: 'Mate Imperial Premium - Cuero Negro',
      description: 'Mate de calabaza forrado en cuero vacuno negro con virola cincelada a mano.',
      price: 45000,
      stock: 12,
      is_active: true,
      categoryName: 'mates',
      sellerName: 'Usuario Vendedor',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqwmnXnUq1RjT53iFgvlp6efUzSc9qnNKsyubt'
    },
    {
      name: 'Termo Stanley Classic 1 Litro',
      description: 'El clásico termo verde que mantiene el agua caliente por 24hs.',
      price: 110000,
      stock: 8,
      is_active: true,
      categoryName: 'termos',
      sellerName: 'Usuario Vendedor',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqaB9K1beyIeC64rzHRPDMNLwapxbclTU7itK2'
    },
    {
      name: 'Yerbera de Cerámica - 1kg',
      description: 'Yerbera de cerámica con tapa hermética.',
      price: 4000,
      stock: 15,
      is_active: true,
      categoryName: 'yerberas',
      sellerName: 'Usuario Vendedor',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqYDe4pScF4z9jZwr2UYDnNlRouSJvV3QsmcgB'
    },
    // Vendedor 2 (Artesanías Sur)
    {
      name: 'Mate Camionero Uruguayo',
      description: 'Mate camionero original de Uruguay, calabaza gruesa.',
      price: 38000,
      stock: 10,
      is_active: true,
      categoryName: 'mates',
      sellerName: 'Artesanías Sur',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriq0n9GxGlkHnZxVbU7KpwWyl3CdBe0cIrv1Dhs'
    },
    {
      name: 'Bombilla Pico Loro Alpaca Maciza',
      description: 'Bombilla forjada en alpaca maciza con detalles florales.',
      price: 18500,
      stock: 25,
      is_active: true,
      categoryName: 'bombillas',
      sellerName: 'Artesanías Sur',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqxYHfsLjzQwyqZUrAosCduOYGltKf4XhIiT60'
    },
    // Vendedor 3 (El Rey del Termo)
    {
      name: 'Termo Lumilagro Acero 1L',
      description: 'Termo Lumilagro modelo acero, excelente relación calidad-precio.',
      price: 28000,
      stock: 40,
      is_active: true,
      categoryName: 'termos',
      sellerName: 'El Rey del Termo',
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqVs1G3S45ykavKJ2UcTYh9ZwuWjrDR4oEztx6'
    }
  ];

  const productosMap = new Map<string, { id_item: string, price: number }>();

  for (const p of productosSemilla) {
    let producto = await prisma.producto.findFirst({ where: { name: p.name } });

    if (!producto) {
      // Mapeamos los IDs autogenerados de las categorías y vendedores guardados en los Maps anteriores
      const id_category = categoriasMap.get(p.categoryName)!;
      const id_seller = vendedoresMap.get(p.sellerName)!;

      producto = await prisma.producto.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          is_active: p.is_active,
          image_url: p.image_url,
          id_category,
          id_seller
        }
      });
      console.log(`  ➕ Producto creado con ID autogenerado: ${producto.name}`);
    } else {
      console.log(`  ✔️ Producto existente detectado: ${producto.name} (ID retenido)`);
    }
    // Guardamos tanto el ID como el precio dinámico para armar las órdenes matemáticas abajo
    productosMap.set(p.name, { id_item: producto.id_item, price: Number(producto.price) });
  }

  // ==========================================
  // 4. GENERAR ÓRDENES HISTÓRICAS DE PRUEBA
  // ==========================================
  console.log('🛍️ Sincronizando órdenes históricas de prueba...');

  const prodMate = productosMap.get('Mate Imperial Premium - Cuero Negro');
  const prodTermo = productosMap.get('Termo Stanley Classic 1 Litro');
  const prodYerbera = productosMap.get('Yerbera de Cerámica - 1kg');

  if (prodMate && prodTermo && prodYerbera) {
    
    // Configuramos las estructuras de las 4 órdenes usando los IDs resueltos en memoria
    const ordenesPrueba = [
      {
        id_payment_operation: `txn_${randomUUID()}`,
        id_buyer: 'user_3DiqOum7deWSCv7RWZxEALa1pkK',
        id_buyer_app: 'app_buyer_iaw',
        total_price: prodMate.price + 1000,
        status: EstadoOrden.PAGADA,
        created_at: getRandomDateInLastMonth(),
        shipping_cost: 1000,
        id_item: prodMate.id_item,
        price_unit: prodMate.price
      },
      {
        id_payment_operation: `txn_${randomUUID()}`,
        id_buyer: 'user_3DiqOum7deWSCv7RWZxEALa1pkK',
        id_buyer_app: 'app_buyer_iaw',
        total_price: prodTermo.price + 2500,
        status: EstadoOrden.PAGADA,
        created_at: getRandomDateInLastMonth(),
        shipping_cost: 2500,
        id_item: prodTermo.id_item,
        price_unit: prodTermo.price
      },
      {
        id_payment_operation: `txn_${randomUUID()}`,
        id_buyer: 'user_3DiqOum7deWSCv7RWZxEALa1pkK',
        id_buyer_app: 'app_buyer_iaw',
        total_price: prodMate.price + prodTermo.price + 1500,
        status: EstadoOrden.CANCELADA,
        created_at: getRandomDateInLastMonth(),
        shipping_cost: 1500,
        id_item: prodMate.id_item, // Nota: Para simplificar el create anidado en el script, mapeamos 1 artículo base
        price_unit: prodMate.price
      },
      {
        id_payment_operation: `txn_${randomUUID()}`,
        id_buyer: 'user_3DiqOum7deWSCv7RWZxEALa1pkK',
        id_buyer_app: 'app_buyer_iaw',
        total_price: prodMate.price + prodTermo.price + prodYerbera.price + 5000,
        status: EstadoOrden.PAGADA,
        created_at: getRandomDateInLastMonth(),
        shipping_cost: 5000,
        id_item: prodYerbera.id_item,
        price_unit: prodYerbera.price
      }
    ];

    for (const o of ordenesPrueba) {
      // Buscamos si la orden ya fue inyectada usando su código de pago único de control
      const existeOrden = await prisma.ordenCompra.findFirst({
        where: { id_payment_operation: o.id_payment_operation }
      });

      if (!existeOrden) {
        await prisma.ordenCompra.create({
          data: {
            id_buyer: o.id_buyer,
            id_buyer_app: o.id_buyer_app,
            total_price: o.total_price,
            status: o.status,
            id_payment_operation: o.id_payment_operation,
            zip_code: 8000,
            address_snapshot: "Avenida Alem 1253, Bahía Blanca",
            created_at: o.created_at, // Forzamos la fecha del pasado
            paquetes: {
              create: [{
                id_seller_app: 'app_seller_iaw',
                id_seller: idSellerPrincipal, // Vinculado dinámicamente al ID del vendedor de la BD
                status: o.status === EstadoOrden.CANCELADA ? EstadoPaquete.CANCELADO : EstadoPaquete.ENTREGADO,
                shipping_cost: o.shipping_cost,
                price_package: o.total_price,
                articulos: {
                  create: [{
                    id_item: o.id_item,
                    quantity: 1,
                    sale_price: o.price_unit
                  }]
                }
              }]
            }
          }
        });
        console.log(`  ➕ Orden histórica inyectada correctamente: ${o.id_payment_operation}`);
      } else {
        console.log(`  ✔️ Orden histórica ya existente: ${o.id_payment_operation} (Omitiendo)`);
      }
    }
  }

  console.log('✅ ¡Base de datos sincronizada y poblada con éxito empleando IDs dinámicos!');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el Seed Dinámico:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

