import Navbar from "@/components/Navbar";

export function ExperienceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <Navbar />
      <div className="h-[420px] bg-surface-container" />
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-3 gap-10">
        <div className="col-span-2 space-y-6">
          <div className="h-8 w-2/3 bg-surface-container rounded" />
          <div className="h-4 w-1/3 bg-surface-container rounded" />
          <div className="h-24 bg-surface-container rounded" />
        </div>
        <div className="col-span-1 h-64 bg-surface-container rounded-2xl" />
      </div>
    </div>
  );
}
