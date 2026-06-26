import Sidebar from "./dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F9F7F2]">
      
      <Sidebar />

     <main className="flex-1 overflow-y-auto bg-[#F9F7F2] w-full">
      {/* El pt-20 asegura que nada quede debajo de la hamburguesa en el celular */}
      {/* max-w-7xl mx-auto centra el contenido en PC */}
        <div className="p-4 pt-20 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
     </main>

    </div>
  );
}