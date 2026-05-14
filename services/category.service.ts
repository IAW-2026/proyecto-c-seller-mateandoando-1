import prisma from '@/lib/prisma';

// Función pura para obtener todas las categorías ordenadas alfabéticamente
export const getCategories = async () => {
  const categories = await prisma.categoria.findMany({
    orderBy: {
      name: 'asc', // 'asc' significa ascendente (A-Z)
    },
  });
  
  return categories;
};