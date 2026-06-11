# 🚀 Brag Document - Desarrollo Personal y Académico

**Nombre:** Guadalupe
**Ubicación:** Bahía Blanca, Argentina
**Formación:** Ingeniería en Sistemas de Información (Universidad Nacional del Sur - UNS)
**Rol:** Desarrolladora Full-Stack
**Período:** Abril 2026 - Presente

## 📌 Proyecto Destacado: Marketplace de Microservicios (Seller App)
Diseño y desarrollo de la "Seller App", un módulo central dentro de un ecosistema de marketplace distribuido (integrado con Buyer App, Payments App y Shipping App). El sistema permite a los vendedores gestionar su catálogo de productos y preparar pedidos, desacoplando la logística del procesamiento de pagos.

### 🛠️ Decisiones Técnicas y Arquitectura
* **Fundación Full-Stack:** Implementación de **Next.js (App Router)** y **TypeScript** para garantizar un tipado estricto de extremo a extremo, facilitando la escalabilidad y previniendo errores en los contratos de las APIs.
* **Modelado de Datos:** Traducción de especificaciones de negocio a un esquema de base de datos relacional robusto utilizando **Prisma ORM**.
* **Infraestructura Cloud:** Despliegue de la base de datos PostgreSQL en **Neon (Serverless)**, seleccionando la región de São Paulo (AWS South America East 1) para minimizar drásticamente la latencia de las transacciones desde Argentina.
* **Seguridad y Autenticación:** Integración de **Clerk** como proveedor centralizado de identidad (JWT), estableciendo las bases para la autorización basada en roles (`metadata.role`) exigida por el sistema.
* **Población de Datos:** Desarrollo de scripts de automatización (*seeds* en TypeScript) para poblar dinámicamente la base de datos con información inicial estructurada (Categorías: mates, termos, bombillas, etc.).
* **Normalización de Contratos de API (Traducción de Dominios):** Implementación de una capa de mapeo de datos (*Data Mapping*) en los endpoints. Esto permite que el modelo de base de datos mantenga nombres en español (coherentes con el diseño local) mientras que las respuestas JSON expuestas cumplen estrictamente con los contratos internacionales en inglés acordados para la intercomunicación con la *Buyer App* (ej. transformando `id_item` relacionales y estructurando sub-objetos de pertenencia como `seller: { id_seller, name, rating }`).

### 📈 Logros Específicos
- [x] Configuración exitosa del entorno de desarrollo integrando herramientas modernas (Next.js 16+, Prisma 7.8.0, TypeScript).
- [x] Resolución de conflictos de compatibilidad de versiones en ORMs mediante la implementación de adaptadores de base de datos (`@prisma/adapter-pg`).
- [x] Modelado de entidades críticas: Vendedores, Productos, Categorías, Órdenes de Compra, Paquetes y Artículos por Paquete.
- [x] Establecimiento de la capa de seguridad requerida para la comunicación inter-servicios.
- [x] **Desarrollo de API Restful con Enrutamiento Dinámico:** Construcción de endpoints avanzados utilizando rutas dinámicas anidadas (`/api/categories/[category_name]/[id_item]`) capaces de procesar parámetros asíncronos y realizar operaciones complejas de filtrado relacional (*Queries con Joins* implícitos en Prisma).
- [x] **Robustez en Consultas (Case Insensitivity):** Implementación de búsquedas agnósticas a mayúsculas/minúsculas (`mode: 'insensitive'`) en PostgreSQL a través de Prisma, previniendo errores de cliente (404) originados por discrepancias en la tipografía de las URLs provenientes de servicios externos.
- [x] **Mitigación Preventiva de Riesgos de Seguridad Criptográfica:** Corrección de strings de conexión a bases de datos remotas mediante la adopción explícita de modos de cifrado SSL estrictos (`sslmode=verify-full`), anticipando y neutralizando advertencias críticas de desaprobación de librerías en motores de Node.js.
- [x] **Consumo de Datos en Servidores (SSR):** Desarrollo de componentes asíncronos del lado del servidor (React Server Components) para consultar de forma directa e hiper-eficiente la base de datos en Neon, logrando renderizar tablas de inventario dinámicas con manejo nativo de estados vacíos e imágenes opcionales (`image_url`).

### 🚀 Flujo de Trabajo e Integración Continua (DevOps)
* **Estrategia de Ramas Eficiente (Git Flow):** Adopción de una política estricta de dos ramas (`main` y `dev`). Mitigación de riesgos operacionales al mantener `main` aislado como entorno de producción sagrado, realizando todo el desarrollo de nuevas características y resolución de bugs exclusivamente dentro de `dev`.
* **Despliegue Continuo (CI/CD) con Vercel:** Configuración y automatización de tuberías de despliegue. Implementación exitosa de *Deploy Previews* dinámicos basados en empujes (*pushes*) automáticos a GitHub, permitiendo testear integraciones de la API en la nube antes de impactar el entorno productivo.
* **Resolución Avanzada de Errores de Compilación (Build Logs):** Diagnóstico y depuración autónoma de fallas en entornos remotos de CI/CD mediante la lectura de registros del compilador de Next.js. Resolución de errores tipados estrictos (ausencia de módulos por omisión de `export default` en rutas de páginas en construcción) y limpieza de parámetros experimentales obsoletos en configuraciones del compilador (`next.config.ts`).

### 🧠 Habilidades Demostradas
* **Arquitectura de Sistemas Distribuidos y Microservicios**
* **Modelado Avanzado de Bases de Datos Relacionales (PostgreSQL & Prisma ORM)**
* **Desarrollo Backend Moderno (Next.js API Routes & Manejo de Promesas Asíncronas)**
* **Diseño de APIs seguras y normalización bajo contratos estrictos (OpenAPI/JSON)**
* **Resolución analítica de problemas de configuración de entorno local y en la nube**
* **Estrategia de control de versiones y flujo de despliegue continuo (Git, GitHub, Vercel CI/CD)**

### 🎨 Diseño de Interfaz y Experiencia de Usuario (UI/UX)
* **Implementación de Design Systems:** Integración de shadcn/ui basado en componentes de Radix UI para garantizar accesibilidad y un diseño profesional consistente.
* **Navegación Dinámica y Route Groups:** Organización de la arquitectura de información mediante el uso de Route Groups `(dashboard)`, permitiendo la separación lógica entre las vistas de autenticación y el panel de control del vendedor sin afectar la jerarquía de las URLs.
* **Personalización Visual Temática:** Desarrollo de una identidad de marca coherente aplicada mediante clases de utilidad de Tailwind CSS, utilizando paletas corporativas específicas (`#1B4332`, `#F9F8F3`) enfocadas en el nicho de productos regionales de alta calidad (mates y termos).