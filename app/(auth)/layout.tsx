export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Usamos flexbox para centrar el formulario de Clerk en el medio de la pantalla
    // y aplicamos el color de fondo cálido para mantener la coherencia visual.
    <div className="flex min-h-screen items-center justify-center bg-[#F9F7F2]">
      {children}
    </div>
  );
}