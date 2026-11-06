import Link from "next/link";
import { StatePanel, buttonPrimary } from "@/components/state-panel";

export default function ProductNotFound() {
  return (
    <div className="py-10">
      <StatePanel
        title="Producto no encontrado"
        actions={
          <Link href="/" className={buttonPrimary}>
            Ver el catálogo
          </Link>
        }
      >
        Este producto no existe o ya no está disponible.
      </StatePanel>
    </div>
  );
}
