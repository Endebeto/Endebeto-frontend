import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type BrandLogoVariant = "horizontal" | "stacked" | "icon" | "wordmark";

type BrandLogoProps = {
  to?: string;
  className?: string;
  imgClassName?: string;
  wordmarkClassName?: string;
  /** Logo variant: 'horizontal' (default), 'stacked', 'icon', or 'wordmark' */
  variant?: BrandLogoVariant;
  /** Rounded light backing so the mark reads on primary / dark sidebars */
  paddedTile?: boolean;
  /** Extra classes on the padded tile wrapper (when paddedTile is true) */
  paddedTileClassName?: string;
  /** Logo mark only — use inside a parent `<Link>` to avoid nested anchors */
  nested?: boolean;
};

const LOGO_SRC: Record<BrandLogoVariant, string> = {
  horizontal: "/logo-horizontal.svg",
  stacked: "/logo-stacked.svg",
  icon: "/logo-icon.svg",
  wordmark: "/logo-wordmark.svg",
};

export function BrandLogo({
  to = "/",
  className,
  imgClassName,
  wordmarkClassName,
  variant = "horizontal",
  paddedTile,
  paddedTileClassName,
  nested,
}: BrandLogoProps) {
  const shellClass = cn(
    "inline-flex shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    className,
  );

  if (variant === "stacked") {
    const stackedContent = (
      <span className="inline-flex flex-col items-center gap-2 text-center">
        <img
          src="/logo-icon.svg"
          alt=""
          width={1053}
          height={503}
          className={cn(
            "h-16 w-auto max-w-[12rem] object-contain object-center sm:h-20 sm:max-w-[14rem]",
            imgClassName,
          )}
        />
        <img
          src="/logo-wordmark.svg"
          alt="Endebeto"
          width={476}
          height={81}
          className={cn(
            "h-6 w-auto max-w-[8.5rem] object-contain object-center sm:h-7 sm:max-w-[10rem]",
            wordmarkClassName,
          )}
        />
      </span>
    );

    if (nested) {
      return <span className={shellClass}>{stackedContent}</span>;
    }

    return (
      <Link to={to} className={shellClass} aria-label="Endebeto home">
        {stackedContent}
      </Link>
    );
  }

  const src = LOGO_SRC[variant] || LOGO_SRC.horizontal;

  const img = (
    <img
      src={src}
      alt="Endebeto"
      width={variant === "icon" ? 1053 : variant === "wordmark" ? 476 : 780}
      height={variant === "icon" ? 503 : variant === "wordmark" ? 81 : 160}
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

  if (nested) {
    return <span className={shellClass}>{inner}</span>;
  }

  return (
    <Link to={to} className={shellClass} aria-label="Endebeto home">
      {inner}
    </Link>
  );
}
