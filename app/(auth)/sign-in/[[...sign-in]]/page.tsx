import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        // 1. 'variables' cambia los colores generales de todo el componente
        variables: {
          colorPrimary: "#1B4332", // Forest Green para botones y acentos
          colorText: "#121f05", // on-surface para los textos
          colorBackground: "#FFFFFF", // Nivel 1 de elevación: fondo blanco
          fontFamily: "Inter, sans-serif", // Tipografía para buena legibilidad
          borderRadius: "0.25rem", // shape.DEFAULT (4px) para inputs
        },
        // 2. 'elements' te permite apuntar a partes específicas usando Tailwind
        elements: {
          // Modificamos la tarjeta contenedora para darle el borde sutil
          card: "shadow-sm border border-[#E5E2D9] rounded-lg",
          
          // Aseguramos que el botón principal respete tu estilo táctil sin sombras exageradas
          formButtonPrimary: "bg-[#1B4332] hover:bg-[#012d1d] text-white shadow-none",
          
          // Los botones secundarios (como iniciar sesión con Google)
          socialButtonsBlockButton: "border border-[#BC6C25] text-[#BC6C25] hover:bg-[#F9F7F2]",
          
          // Las etiquetas de los inputs
          formFieldLabel: "font-semibold text-sm tracking-wide",
        }
      }}
    />
  );
}