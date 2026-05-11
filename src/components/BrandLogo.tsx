import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  to?: string;
  className?: string;
  imgClassName?: string;
  /** Rounded light backing so the mark reads on primary / dark sidebars */
  paddedTile?: boolean;
  /** Extra classes on the padded tile wrapper (when paddedTile is true) */
  paddedTileClassName?: string;
  /** Logo mark only — use inside a parent `<Link>` to avoid nested anchors */
  nested?: boolean;
};

export function BrandLogo({
  to = "/",
  className,
  imgClassName,
  paddedTile,
  paddedTileClassName,
  nested,
}: BrandLogoProps) {
  const img = (
    <img
      src="/logo.svg"
      alt=""
      width={572}
      height={486}
      className={cn(
        "h-8 w-auto max-w-[9.5rem] object-contain object-left sm:h-9 sm:max-w-[11rem]",
        imgClassName,
      )}
    />
  );

  const inner = paddedTile ? (
    <span
      className={cn(
        "inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 shadow-md shadow-black/8 ring-1 ring-black/[0.07]",
        paddedTileClassName,
      )}
    >
      {img}
    </span>
  ) : (
    img
  );

  const shellClass = cn(
    "inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    className,
  );

  if (nested) {
    return <span className={shellClass}>{inner}</span>;
  }

  return (
    <Link to={to} className={shellClass} aria-label="Endebeto home">
      {inner}
    </Link>
  );
}
