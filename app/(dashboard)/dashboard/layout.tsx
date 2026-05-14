import Sidebar from "./Sidebar";

// Este componente NO se recarga cuando el usuario navega entre las opciones 
// del dashboard. Solo cambia lo que viaja adentro de "children".
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F9F7F2]">
      {/* Columna Izquierda: La barra estática */}
      <Sidebar />

      {/* Columna Derecha: El contenido dinámico */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}