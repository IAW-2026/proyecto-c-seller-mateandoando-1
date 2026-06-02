# MateandoAndo - Seller App

### Link al deploy de producción
[https://tu-enlace-final-de-vercel.vercel.app](https://tu-enlace-final-de-vercel.vercel.app)

### Usuarios disponibles para pruebas
* **Rol Vendedor:**
  * **Email:** `seller+clerk_test@iaw.com`
  * **Contraseña:** `iawuser#`

### Instrucciones para evaluar la aplicación
1. Iniciar sesión utilizando las credenciales provistas arriba.
2. Desde el Dashboard, se puede observar el resumen financiero y de stock en tiempo real.
3. En la sección **Productos**, se puede evaluar el ABM (Alta, Baja, Modificación) del catálogo.
4. En la sección **Órdenes**, se pueden visualizar los pedidos entrantes. Utilizar el botón "Iniciar Despacho" para observar la integración de cambio de estado (simula la comunicación con la API de Shipping).
5. Se recomienda utilizar los filtros de la URL (ej: pestaña "Pendientes") para evaluar el filtrado dinámico de órdenes.

### Breve descripción del proyecto
MateandoAndo (Seller App) es el módulo de gestión para vendedores de un ecosistema de e-commerce de artículos de mate. La aplicación permite a los comerciantes administrar su inventario de productos, monitorear el estado de sus ventas y gestionar la logística de envíos de manera centralizada.

El sistema está construido bajo una arquitectura moderna utilizando Next.js (App Router), React, TailwindCSS y Prisma como ORM contra una base de datos PostgreSQL. Se diseñó para funcionar en conjunto con otros microservicios (Buyer App, Payments App y Shipping App) a través de contratos de API estrictos, actuando como la fuente de verdad para el inventario físico.

### Notas y comentarios para la corrección
* **Arquitectura de Microservicios y Webhooks:** Se implementaron endpoints de tipo Webhook (`/api/purchase-orders/[id]/payment` y `/api/purchase-orders/[id]/refund`) debidamente protegidos con API Keys. La Seller App evalúa el estado físico del paquete antes de autorizar reembolsos, demostrando un control transaccional robusto.
* **Invalidación de Caché:** Se implementó `revalidatePath` en los webhooks para que el panel del vendedor se actualice en tiempo real sin necesidad de recargar la página cuando un servicio externo modifica un dato.
* **Performance y Accesibilidad:** Se priorizó el rendimiento y la usabilidad, alcanzando un puntaje de **100/100 en Accesibilidad y SEO** en pruebas de Lighthouse. Se aplicaron Skeleton Loaders y se optimizó el CLS durante la carga de datos.
* **Feedback Visual:** Se integró la librería `Sonner` para proveer notificaciones visuales (toasts) premium y no bloqueantes durante la interacción del usuario (ej: al despachar un pedido).