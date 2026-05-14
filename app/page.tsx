import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Importamos el componente de shadcn

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F2] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-[#E5E2D9] p-8 text-center">
        <h1 className="text-3xl font-bold text-[#1B4332] mb-2 font-manrope">
          MateandoAndo Seller
        </h1>
        <p className="text-[#414844] mb-8 font-inter">
          Gestiona tu inventario de productos relacionados al mundo del mate.
        </p>

        <div className="flex flex-col gap-4 mt-6">
          
          <Button asChild className="w-full bg-[#1B4332] hover:bg-[#012d1d] text-white py-6">
            <Link href="/sign-in">
              Iniciar Sesión
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full border-[#BC6C25] text-[#BC6C25] hover:bg-[#F9F7F2] hover:text-[#BC6C25] py-6">
            <Link href="/sign-up">
              Registrar mi Tienda
            </Link>
          </Button>

        </div>
      </div>
    </main>
  );
}