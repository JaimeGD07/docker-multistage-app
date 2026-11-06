import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/money";
import { ProductImage } from "./product-image";
import { StockIndicator } from "./stock-indicator";

type Props = { product: Product; eager?: boolean };

export function ProductCard({ product, eager }: Props) {
  return (
    <li>
      <Link
        href={`/productos/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-panel transition-colors hover:border-amber/60"
      >
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
          eager={eager}
          className="border-b border-line"
        />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h2 className="line-clamp-2 min-h-[3rem] font-display text-lg font-semibold leading-snug">
            {product.name}
          </h2>
          <div className="mt-auto flex items-end justify-between gap-3">
            <p className="font-display text-2xl font-bold text-amber">
              {formatPrice(product.price)}
            </p>
            <StockIndicator stock={product.stock} />
          </div>
        </div>
      </Link>
    </li>
  );
}
