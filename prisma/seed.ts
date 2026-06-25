import { PrismaClient, EstadoOrden, EstadoPaquete } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la carga de datos (Solo inserciones nuevas)...');

  // ==========================================
  // 1. CARGAR CATEGORÍAS
  // ==========================================
  console.log('📦 Revisando categorías...');
  const categoriasNombres = ['mates', 'termos', 'bombillas', 'yerberas', 'canastas', 'combos'];
  const categoriasMap = new Map(); 
  
  for (const nombre of categoriasNombres) {
    let categoria = await prisma.categoria.findFirst({ where: { name: nombre } });
    
    if (!categoria) {
      categoria = await prisma.categoria.create({ data: { name: nombre } });
      console.log(`  ➕ Categoría creada: ${categoria.name}`);
    }
    categoriasMap.set(nombre, categoria);
  }

  // ==========================================
  // 2. CREAR MÚLTIPLES VENDEDORES
  // ==========================================
  console.log('👥 Revisando Vendedores...');
  
  const vendedoresData = [
    {
      email: 'seller+clerk_test@iaw.com',
      clerk_user_id: 'user_3EYFA7wDLmgUdEgEgROVBkYqXuI', 
      name: 'Usuario Vendedor',
      address: 'Calle Falsa 123, Ciudad',
      sales_made: 0,
      rating: 0
    },
    {
      email: 'ventasartesaniassur@iaw.com',
      clerk_user_id: 'user_3Fdq7snbj5DxxzfA4csyvC5BaRD', 
      name: 'Artesanías Sur',
      address: 'Av. Alem 1253, Bahía Blanca',
      sales_made: 45,
      rating: 4.8
    },
    {
      email: 'contactoelrey@iaw.com',
      clerk_user_id: 'user_3FdqCmVcrmUxtYF00N8Nz4RUGnf', 
      name: 'El Rey del Termo',
      address: 'Chiclana 500, Bahía Blanca',
      sales_made: 120,
      rating: 4.5
    }
  ];

  const vendedoresMap = new Map();

  for (const vData of vendedoresData) {
    let vendedor = await prisma.vendedor.findFirst({
      where: { email: vData.email } 
    });

    if (!vendedor) {
      vendedor = await prisma.vendedor.create({ data: vData });
      console.log(`  ➕ Vendedor creado: ${vendedor.name}`);
    } else {
      // SOLO INFORMA, NO ACTUALIZA
      console.log(`  ✔️ Vendedor ya existe: ${vendedor.name} (Omitiendo)`);
    }
    vendedoresMap.set(vendedor.name, vendedor);
  }

  const vendedorApp = vendedoresMap.get('Usuario Vendedor');

  // ==========================================
  // 3. CARGAR PRODUCTOS DEL CATÁLOGO
  // ==========================================
  console.log('🧉 Revisando productos del catálogo...');
  
  const matesCategory = categoriasMap.get('mates');
  const termosCategory = categoriasMap.get('termos');
  const bombillasCategory = categoriasMap.get('bombillas');
  const yerberasCategory = categoriasMap.get('yerberas');
  const canastasCategory = categoriasMap.get('canastas');
  const combosCategory = categoriasMap.get('combos');

  const productosSemilla = [
    // --- PRODUCTOS DEL VENDEDOR 1 ---
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
      name: 'Termo Stanley Classic 1 Litro',
      description: 'El clásico termo verde que mantiene el agua caliente por 24hs. Con manija.',
      price: 110000,
      stock: 8,
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqaB9K1beyIeC64rzHRPDMNLwapxbclTU7itK2'
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
    },
    {
      name: 'Termo Media Manija 1L - Acero',
      description: 'Termo de acero inoxidable con pico cebador de precisión. Ideal para viajes.',
      price: 45000,
      stock: 0, 
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedorApp.id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqTIM0pMtLimNWlcd0Dv95CPUspZtbwfEOHoyG'
    },

    // --- PRODUCTOS DEL VENDEDOR 2 ---
    {
      name: 'Mate Camionero Uruguayo',
      description: 'Mate camionero original de Uruguay, calabaza gruesa y virola lisa de acero.',
      price: 38000,
      stock: 10,
      is_active: true,
      id_category: matesCategory.id_category,
      id_seller: vendedoresMap.get('Artesanías Sur').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriq0n9GxGlkHnZxVbU7KpwWyl3CdBe0cIrv1Dhs'
    },
    {
      name: 'Bombilla Pico Loro Alpaca Maciza',
      description: 'Bombilla forjada en alpaca maciza con detalles florales. No se tapa nunca.',
      price: 18500,
      stock: 25,
      is_active: true,
      id_category: bombillasCategory.id_category,
      id_seller: vendedoresMap.get('Artesanías Sur').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqxYHfsLjzQwyqZUrAosCduOYGltKf4XhIiT60'
    },
    {
      name: 'Canasta Matera de Cuero Crudo',
      description: 'Matera 100% cuero vacuno crudo con costuras a mano. División para termo y mate.',
      price: 55000,
      stock: 4,
      is_active: true,
      id_category: canastasCategory.id_category,
      id_seller: vendedoresMap.get('Artesanías Sur').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqqhXc9QZm2JhpTiIMtdQ9KEcHF0kvgDZ8bGXy'
    },

    // --- PRODUCTOS DEL VENDEDOR 3 ---
    {
      name: 'Termo Lumilagro Acero 1L',
      description: 'Termo Lumilagro modelo acero, excelente relación calidad-precio para el día a día.',
      price: 28000,
      stock: 40,
      is_active: true,
      id_category: termosCategory.id_category,
      id_seller: vendedoresMap.get('El Rey del Termo').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqVs1G3S45ykavKJ2UcTYh9ZwuWjrDR4oEztx6'
    },
    {
      name: 'Combo Estudiantil (Termo + Mate + Bombilla)',
      description: 'Combo ideal para la facu. Termo bala, mate de vidrio forrado y bombilla económica.',
      price: 35000,
      discount_price: 29900, 
      stock: 15,
      is_active: true,
      id_category: combosCategory.id_category,
      id_seller: vendedoresMap.get('El Rey del Termo').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqNaWYveGZJdsra2Ppxv67XbMn3lOVKT4mutyI'
    },
    {
      name: 'Yerbera y Azucarera de Lata - Vintage',
      description: 'Set de latas con pico vertedor plástico, diseño vintage anti-humedad.',
      price: 8500,
      stock: 30,
      is_active: true,
      id_category: yerberasCategory.id_category,
      id_seller: vendedoresMap.get('El Rey del Termo').id_seller,
      image_url: 'https://aa2b4pe3oj.ufs.sh/f/IHl2mafHoriqCqgPvAvHKX4cnsN596HIyogGjxVhUAwekZrP'
    }
  ];

  for (const prod of productosSemilla) {
    const existe = await prisma.producto.findFirst({ where: { name: prod.name } });
    
    if (!existe) {
      await prisma.producto.create({ data: prod });
      console.log(`  ➕ Producto nuevo creado: ${prod.name}`);
    } else {
      // SOLO INFORMA, NO ACTUALIZA
      console.log(`  ✔️ Producto ya existe: ${prod.name} (Omitiendo)`);
    }
  }
  console.log('✅ ¡Seed completado respetando tus datos actuales!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });