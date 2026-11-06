import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  /** true en las primeras imagenes visibles (mejora el LCP) */
  eager?: boolean;
  className?: string;
};

export function ProductImage({ src, alt, sizes, eager, className = "" }: Props) {
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden bg-panel-2 ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt} (sin imagen)`}
          className="flex h-full items-center justify-center text-line-strong"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
          </svg>
        </div>
      )}
    </div>
  );
}
