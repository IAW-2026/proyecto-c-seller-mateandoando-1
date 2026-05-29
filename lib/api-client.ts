// lib/api-client.ts

/**
 * Función Helper para hacer peticiones (fetch) seguras entre aplicaciones.
 * * ¿Para qué lo armamos?
 * Porque cada vez que necesitamos pedirle datos a la Buyer App o a la Shipping App,
 * tenemos que inyectar el token JWT de Clerk del vendedor logueado. 
 * En vez de repetir ese código de cabeceras en cada botón, usamos esta función centralizada.
 * * @param url - La URL completa del servicio externo (ej: "https://buyer-app.../api/buyers/123")
 * @param token - El JWT crudo que sacamos de Clerk (usando getToken() en el componente)
 * @param options - Configuraciones extra del fetch (method: "POST", body: {...}, etc.)
 */
export async function fetchAutenticado(
  url: string,
  token: string | null, // Acepta null por si justo se venció la sesión en ese milisegundo
  options: RequestInit = {} // RequestInit es el tipo de datos estándar de React para fetch
) {
  
  // 1. Validamos que el token exista antes de intentar comunicarnos
  if (!token) {
    // Si no hay token, directamente cortamos la ejecución.
    // Esto evita que hagamos peticiones basura a las otras apps que sabemos que nos van a rebotar.
    throw new Error("Error de Autenticación: No se encontró un token válido de Clerk.");
  }

  // 2. Preparamos las cabeceras base
  const headers = new Headers(options.headers || {});
  
  // 3. LA CLAVE DE TODO: Inyectamos el JWT en el estándar Authorization Bearer
  // Esto es lo que la otra aplicación (Buyer/Shipping) va a leer para saber quién soy.
  headers.set("Authorization", `Bearer ${token}`);
  
  // 4. Si vamos a mandar datos (POST/PATCH), avisamos que es formato JSON
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 5. Armamos la configuración final fusionando las opciones que me pasaron con mis cabeceras seguras
  const configFinal = {
    ...options,
    headers,
  };

  try {
    // 6. Ejecutamos la petición real
    const response = await fetch(url, configFinal);

    // 7. Si el servidor de la otra app me patea (ej: 401 Unauthorized o 500 Error), tiro el error
    if (!response.ok) {
      // Intento leer el mensaje de error que me mandaron, o pongo uno genérico
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Error en la API (${response.status}): ${errorData?.error || "Fallo desconocido"}`
      );
    }

    // 8. Si todo salió bien (status 200/201), devuelvo los datos listos para usar
    return await response.json();
    
  } catch (error) {
    // Atrapamos errores de red (ej: se cortó internet o la URL de la otra app está caída)
    console.error(`Falló la petición a ${url}:`, error);
    // Vuelvo a lanzar el error para que el componente que apretó el botón sepa que algo falló
    throw error;
  }
}