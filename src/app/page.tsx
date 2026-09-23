import Cotizador from "@/components/Cotizador";
import { getPrecios } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { precios } = await getPrecios();

  return (
    <div className="h-full">
      <Cotizador preciosIniciales={precios} />
    </div>
  );
}
