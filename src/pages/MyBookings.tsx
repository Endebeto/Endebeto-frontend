import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { bookingsService, type Booking } from "@/services/bookings.service";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function experienceTitle(b: Booking) {
  const ex = b.experience;
  if (ex && typeof ex === "object" && "title" in ex) return ex.title;
  return "Experience";
}

export default function MyBookings() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-bookings", { page: 1, limit: 50 }],
    queryFn: async () => {
      const res = await bookingsService.getMyBookings({ page: 1, limit: 50 });
      return res.data;
    },
  });

  const bookings = data?.data ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-16 max-w-3xl mx-auto px-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 mt-6 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-headline font-extrabold text-2xl text-primary">My Bookings</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                {total === 0
                  ? "You have no bookings yet."
                  : `You have ${total} booking${total === 1 ? "" : "s"}.`}
              </p>
            </div>
            <Link
              to="/experiences"
              className="shrink-0 text-sm font-bold text-primary hover:underline"
            >
              Browse experiences
            </Link>
          </div>

          {summary && total > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 text-center">
              {(
                [
                  ["Upcoming", summary.upcoming, "text-sky-600 dark:text-sky-400", "bg-sky-50 dark:bg-sky-900/20"],
                  ["Completed", summary.completed, "text-emerald-600 dark:text-emerald-400", "bg-emerald-50 dark:bg-emerald-900/20"],
                  ["Expired", summary.expired, "text-zinc-500 dark:text-zinc-400", "bg-zinc-100 dark:bg-zinc-800"],
                ] as const
              ).map(([label, value, color, bg]) => (
                <div key={label} className={`${bg} rounded-xl p-3`}>
                  <p className={`text-xl font-headline font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-16 text-on-surface-variant">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {isError && (
            <p className="text-red-600 text-sm py-8 text-center">
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Could not load bookings."}
            </p>
          )}

          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold text-on-surface">No bookings yet</p>
              <p className="text-sm mt-1">Book an experience to see it here.</p>
            </div>
          )}

          {!isLoading && !isError && bookings.length > 0 && (
            <ul className="space-y-3">
              {bookings.map((b) => {
                const statusStyle =
                  b.status === "upcoming"
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    : b.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : b.status === "cancelled"
                        ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
                const exId =
                  typeof b.experience === "object" && b.experience?._id
                    ? b.experience._id
                    : String(b.experience);
                return (
                  <li key={b._id}>
                    <Link
                      to={`/experiences/${exId}`}
                      className="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl hover:shadow-sm transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-primary dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface dark:text-white truncate">
                          {experienceTitle(b)}
                        </p>
                        <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                          {formatDate(b.experienceDate ?? b.createdAt)} · {b.quantity} guest
                          {b.quantity > 1 ? "s" : ""}
                          {b.paid ? " · Paid" : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-primary dark:text-green-400">
                          ETB {b.price?.toLocaleString?.() ?? b.price}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
