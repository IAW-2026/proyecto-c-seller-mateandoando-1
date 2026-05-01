import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Creamos el adaptador pasándole tu URL de la base de datos
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

// 2. Inicializamos Prisma usando ese adaptador (¡La regla obligatoria de Prisma 7!)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando la carga de datos (Seed)...');

  const categoriasNombres = ['mates', 'termos', 'bombillas', 'yerberas', 'canastas', 'combos'];
  
  for (const nombre of categoriasNombres) {
    const categoria = await prisma.categoria.create({
      data: {
        name: nombre,
      },
    });
    console.log(`Categoría creada: ${categoria.name}`);
  }

  console.log('¡Datos iniciales cargados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });