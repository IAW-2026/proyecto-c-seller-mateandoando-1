// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definimos qué rutas reales queremos proteger. 
// Como tus URLs ya no tienen la palabra dashboard, las listamos explícitamente:
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",   // Protege /dashboard y cualquier cosa adentro
  "/nuevo(.*)",       // Protege /nuevo y cualquier cosa adentro
  "/productos(.*)",   // Protege /productos y cualquier cosa adentro
  "/ordenes(.*)",     // Protege /ordenes y cualquier cosa adentro
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Si el usuario intenta entrar a una ruta protegida...
  if (isProtectedRoute(req)) {
    // ...el método protect() verifica si está logueado.
    // Si no lo está, lo redirige automáticamente a la pantalla de login.
    await auth.protect();
  }
});

// Esta configuración de Clerk es intocable (optimiza archivos estáticos)
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};