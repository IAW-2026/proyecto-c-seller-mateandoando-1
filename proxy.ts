import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definimos qué rutas queremos proteger. 
// En este caso, todo lo que empiece con /dashboard
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Si el usuario intenta entrar a una ruta protegida...
  if (isProtectedRoute(req)) {
    // ...el método protect() verifica si está logueado.
    // Si no lo está, lo redirige automáticamente a tu página de /sign-in personalizada.
    await auth.protect();
  }
});

// Esta configuración viene por defecto en Clerk y es necesaria para 
// que el middleware no bloquee imágenes, CSS o archivos estáticos.
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};