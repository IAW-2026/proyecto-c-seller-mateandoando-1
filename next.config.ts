/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. La nueva regla de CORS para abrirle la puerta a tus compañeros
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  },

  // 2. Tu configuración actual de Turbopack intacta
  experimental: {
    turbopack: {
      root: "./", 
    },
  },
};

export default nextConfig;