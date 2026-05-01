# 🚀 Brag Document - Desarrollo Personal y Académico

**Nombre:** [Guadalupe]
**Ubicación:** Bahía Blanca, Argentina
**Formación:** Ingeniería en Sistemas de Información (UNS)
**Rol:** Desarrollador Full-Stack
**Período:** Abril 2026 - Presente

## 📌 Proyecto Destacado: Marketplace de Microservicios (Seller App)
Diseño y desarrollo de la "Seller App", un módulo central dentro de un ecosistema de marketplace distribuido (integrado con Buyer App, Payments App y Shipping App). El sistema permite a los vendedores gestionar su catálogo de productos y preparar pedidos, desacoplando la logística del procesamiento de pagos.

### 🛠️ Decisiones Técnicas y Arquitectura
*   **Fundación Full-Stack:** Implementación de **Next.js (App Router)** y **TypeScript** para garantizar un tipado estricto de extremo a extremo, facilitando la escalabilidad y previniendo errores en los contratos de las APIs.
*   **Modelado de Datos:** Traducción de especificaciones de negocio a un esquema de base de datos relacional robusto utilizando **Prisma ORM**.
*   **Infraestructura Cloud:** Despliegue de la base de datos PostgreSQL en **Neon (Serverless)**, seleccionando la región de São Paulo (AWS South America East 1) para minimizar drásticamente la latencia de las transacciones desde Argentina.
*   **Seguridad y Autenticación:** Integración de **Clerk** como proveedor centralizado de identidad (JWT), estableciendo las bases para la autorización basada en roles (`metadata.role`) exigida por el sistema.
*   **Población de Datos:** Desarrollo de scripts de automatización (*seeds* en TypeScript) para poblar dinámicamente la base de datos con información inicial estructurada (Categorías: mates, termos, bombillas, etc.).

### 📈 Logros Específicos
- [x] Configuración exitosa del entorno de desarrollo integrando herramientas modernas (Next.js 14+, Prisma 7.8.0, TypeScript).
- [x] Resolución de conflictos de compatibilidad de versiones en ORMs mediante la implementación de adaptadores de base de datos (`@prisma/adapter-pg`).
- [x] Modelado de entidades críticas: Vendedores, Productos, Categorías, Órdenes de Compra, Paquetes y Artículos por Paquete.
- [x] Establecimiento de la capa de seguridad requerida para la comunicación inter-servicios.

### 🧠 Habilidades Demostradas
*   Arquitectura de Sistemas Distribuidos
*   Modelado de Bases de Datos Relacionales (PostgreSQL)
*   Resolución analítica de problemas de configuración de entorno
*   Gestión de control de versiones (Git/GitHub)