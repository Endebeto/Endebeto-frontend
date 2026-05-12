import type { ReactNode } from "react";

export function HeroCard({
  label,
  value,
  sub,
  tone = "light",
  icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "light" | "dark";
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-2 shadow-sm ${
        tone === "dark"
          ? "bg-primary text-white shadow-xl shadow-primary/20"
          : "bg-white dark:bg-[#2d3133] border border-outline-variant/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            tone === "dark" ? "text-white/70" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
        <span
          className={tone === "dark" ? "text-white/60" : "text-primary/60"}
        >
          {icon}
        </span>
      </div>
      <p
        className={`font-headline font-extrabold text-2xl md:text-[28px] leading-none ${
          tone === "dark" ? "text-white" : "text-primary"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] ${
            tone === "dark" ? "text-white/80" : "text-on-surface-variant"
          }`}
        >
          {sub}
        </p>
      )}
      {children && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

export function KpiTile({
  label,
  value,
  icon,
  accent,
  children,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#2d3133] border border-outline-variant/10 shadow-sm flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <span className={`${accent ?? "text-primary/60"}`}>{icon}</span>
      </div>
      <p className="font-headline font-extrabold text-xl text-primary leading-none">
        {value}
      </p>
      {children && <div>{children}</div>}
    </div>
  );
}
