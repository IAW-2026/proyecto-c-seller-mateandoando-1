# Reglas de Proyecto para Asistentes de IA (Seller App)

## Stack Tecnológico
- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript (Tipado estricto obligatorio)
- **Base de Datos:** PostgreSQL alojada en Neon
- **ORM:** Prisma (v7.8.0 usando `@prisma/adapter-pg`)
- **Autenticación:** Clerk
- **Estilos:** Tailwind CSS / CSS Modules

## Arquitectura y Principios SOLID
- **Separación de Responsabilidades (SRP):** Las rutas de la API (`app/api/.../route.ts`) NO deben contener lógica de negocio compleja. Su única función es recibir la request HTTP, validar permisos y llamar a una función en la carpeta `/services`.
- **Acceso a Datos:** Toda la interacción con Prisma debe realizarse a través de archivos de servicio (ej. `services/product.service.ts`).
- **Autenticación:** Proteger rutas sensibles obteniendo el ID del usuario (`userId`) mediante `@clerk/nextjs`. Validar que el usuario tenga el rol `seller` para acciones de modificación de catálogo.

## Convenciones de Código
- Usar funciones flecha (`const MiComponente = () => {}`) para componentes de React.
- Tipar exhaustivamente las respuestas de las APIs y los props de los componentes.
- Priorizar componentes de servidor (Server Components) por defecto. Usar `"use client"` únicamente cuando sea estrictamente necesario para interactividad (ej. botones, hooks de estado).
- Los nombres de variables y funciones deben estar en inglés, pero los datos de negocio (semillas) pueden estar en español.
