import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  to?: string;
  className?: string;
  imgClassName?: string;
  /** Rounded light backing so the mark reads on primary / dark sidebars */
  paddedTile?: boolean;
};

export function BrandLogo({
  to = "/",
  className,
  imgClassName,
  paddedTile,
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
    <span className="inline-flex items-center rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-black/10">
      {img}
    </span>
  ) : (
    img
  );

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className,
      )}
      aria-label="Endebeto home"
    >
      {inner}
    </Link>
  );
}
