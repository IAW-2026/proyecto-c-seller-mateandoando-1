/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le decimos explícitamente a Turbopack que la raíz absoluta de 
  // nuestro universo es esta misma carpeta ("./"), y que está prohibido buscar más arriba.
  experimental: {
    turbopack: {
      root: "./", 
    },
  },
};

export default nextConfig;