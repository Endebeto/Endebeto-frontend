import { cn } from "@/lib/utils";

/** Pin positions tuned for /imgs/ethiopia-map.svg (country silhouette, object-contain). */
const ETHIOPIA_LOCATIONS = [
  { name: "Addis Ababa", left: "52%", top: "52%" },
  { name: "Lalibela", left: "50%", top: "42%" },
  { name: "Omo Valley", left: "48%", top: "72%" },
] as const;

type EthiopiaExploreMapProps = {
  className?: string;
};

export default function EthiopiaExploreMap({ className }: EthiopiaExploreMapProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-accent/35 bg-[#031f1a] shadow-2xl ring-1 ring-white/10",
        className,
      )}
      aria-label="Map of Ethiopia with featured regions"
    >
      <img
        src="/imgs/ethiopia-map.svg"
        alt="Outline map of Ethiopia"
        className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain opacity-35 [filter:brightness(0)_invert(1)] motion-reduce:opacity-30"
        loading="lazy"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#042f26]/90 via-[#042f26]/20 to-[#042f26]/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-inset ring-accent/25"
        aria-hidden
      />

      <p className="absolute left-4 top-4 z-10 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-accent md:left-5 md:top-5 md:text-xs">
        Ethiopia
      </p>

      <ul className="absolute inset-0 z-10 m-0 list-none p-0">
        {ETHIOPIA_LOCATIONS.map(({ name, left, top }) => (
          <li
            key={name}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left, top }}
          >
            <div className="flex flex-col items-center">
              <span className="block h-2.5 w-2.5 rounded-full border-2 border-white bg-accent shadow-md" />
              <span className="mt-1 whitespace-nowrap rounded-md bg-black/50 px-1.5 py-0.5 font-headline text-[10px] font-semibold text-white md:text-[11px]">
                {name}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="absolute bottom-4 left-4 right-4 z-10 text-center font-body text-xs leading-relaxed text-white/80 md:bottom-5">
        Curated experiences across Ethiopia. Book from anywhere in the world.
      </p>
    </div>
  );
}
