import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, CalendarDays, Compass, TrendingUp,
  PlusCircle, Wallet, Clock, ChevronRight, Star, ArrowRight,
  Users, Leaf, Loader2, AlertCircle, Phone, X, Ban,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HostLayout from "@/components/HostLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { experiencesService, type Experience } from "@/services/experiences.service";
import { walletService } from "@/services/wallet.service";

/* ─── helpers ────────────────────────────────────────── */
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const statusStyle: Record<string, string> = {
  upcoming:  "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-emerald-300",
  completed: "bg-surface-container-high text-on-surface-variant dark:bg-zinc-700 dark:text-zinc-300",
  expired:   "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  cancelled: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabel: Record<string, string> = {
  upcoming: "Upcoming", completed: "Completed", expired: "Expired", cancelled: "Cancelled",
};

/* ─── component ──────────────────────────────────────── */
export default function HostDashboard() {
  const { user } = useAuth();
  const [phoneNudgeDismissed, setPhoneNudgeDismissed] = useState(
    () => localStorage.getItem("hostPhoneNudgeDismissed") === "1"
  );

  const dismissPhoneNudge = () => {
    localStorage.setItem("hostPhoneNudgeDismissed", "1");
    setPhoneNudgeDismissed(true);
  };

  const firstName = user?.name?.split(" ")[0] ?? "Host";
  const listingLocked =
    user?.hostStatus === "approved" && user?.hostListingSuspended === true;

  /* Fetch last 50 bookings so we have enough to build performance stats */
  const { data: bookingsData, isLoading: bLoading, isError: bError } = useQuery({
    queryKey: ["host-bookings-dashboard"],
    queryFn: () => bookingsService.getHostBookings({ limit: 50 }),
  });

  const { data: expData, isLoading: eLoading } = useQuery({
    queryKey: ["my-experiences"],
    queryFn: () => experiencesService.getMyExperiences(),
  });

  const { data: walletData } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: () => walletService.getWallet(),
    staleTime: 30_000,
  });

  const allBookings: Booking[] = bookingsData?.data.data ?? [];
  const summary                = bookingsData?.data.summary ?? { upcoming: 0, completed: 0, expired: 0 };

  const wallet = walletData?.data.data.wallet;
  const availableBalanceCents = wallet?.availableBalanceCents ?? 0;
  const totalEarnedCents      = wallet?.totalEarnedCents ?? 0;

  // Total confirmed guests across all upcoming bookings (sum of quantity, not booking count)
  const upcomingGuestCount = allBookings
    .filter(b => b.status === "upcoming")
    .reduce((sum, b) => sum + (b.quantity ?? 1), 0);
  const etb = (cents: number) => (cents / 100).toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const recentBookings         = allBookings.slice(0, 5);

  const allExperiences: Experience[] = expData?.data.data.data ?? [];
  const activeCount = allExperiences.filter((e) => e.status === "approved").length;

  /* ── Build per-experience booking stats from the fetched list ── */
  const expBookingMap = new Map<string, number>();
  allBookings.forEach((b) => {
    const expId = typeof b.experience === "string" ? b.experience : b.experience?._id;
    if (expId) expBookingMap.set(expId, (expBookingMap.get(expId) ?? 0) + 1);
  });

  const performances = allExperiences
    .filter((e) => e.status === "approved")
    .map((e) => {
      const id = e._id ?? e.id;
      const bookings = expBookingMap.get(id) ?? 0;
      const maxBookings = Math.max(...[...expBookingMap.values(), 1]);
      return {
        id,
        name: e.title,
        image: e.imageCover,
        bookings,
        rating: e.ratingsAverage,
        reviews: e.ratingsQuantity,
        pct: Math.round((bookings / maxBookings) * 100) || 5,
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 4);

  const isLoading = bLoading || eLoading;

  return (
    <HostLayout
      hostName={user?.name ?? "Host"}
      hostInitials={(user?.name ?? "H").slice(0, 2).toUpperCase()}
      hostTitle="Host"
    >
      <main className="p-4 md:p-10 max-w-[1440px]">

        {/* ── Welcome ──────────────────────────────────── */}
        <header className="mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight mb-2">
            Welcome back, {firstName}!
          </h2>
          <p className="text-on-surface-variant dark:text-zinc-400 text-sm md:text-base">
            Here's a live snapshot of your hosting activity.
          </p>
        </header>

        {listingLocked && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <Ban className="h-4 w-4 text-amber-900 dark:text-amber-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Listings are temporarily limited
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/90 mt-1 leading-relaxed">
                You can sign in and view your experiences, but creating new listings or editing schedules is turned off. If you have questions, contact support.
              </p>
            </div>
          </div>
        )}

        {/* ── Phone nudge banner ───────────────────────── */}
        {!user?.phone && !phoneNudgeDismissed && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-[#ffddb8]/30 dark:bg-amber-900/20 border border-[#ffddb8]/70 dark:border-amber-700/40 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#ffddb8]/60 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="h-4 w-4 text-[#653e00] dark:text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#3d2200] dark:text-amber-200">Add your WhatsApp number</p>
              <p className="text-xs text-[#653e00] dark:text-amber-300 mt-0.5 leading-relaxed">
                Guests who book your experience can only contact you through the platform.
                Adding your phone lets them reach you directly on WhatsApp for last-minute questions and coordination.
              </p>
              <a
                href="/profile"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#653e00] dark:text-amber-300 underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Add phone in Profile →
              </a>
            </div>
            <button
              onClick={dismissPhoneNudge}
              className="p-1 rounded-lg hover:bg-[#ffddb8]/60 dark:hover:bg-amber-900/40 transition-colors text-[#653e00] dark:text-amber-300 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Stats + Quick Actions bento ──────────────── */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-6 md:mb-12">

          {/* Stats row */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-2 md:gap-6">

            {/* Wallet / Available Balance */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <Banknote className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Available Balance</p>
              </div>
              <div className="mt-2 md:mt-4">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-green-400" />
                ) : (
                  <>
                    <h3 className="text-base md:text-2xl font-headline font-bold text-primary dark:text-green-400 leading-tight">
                      {etb(availableBalanceCents)} <span className="text-[10px] md:text-sm font-normal text-on-surface-variant dark:text-zinc-400">ETB</span>
                    </h3>
                    <p className="text-[9px] md:text-xs text-primary-container dark:text-green-500 mt-1 flex items-center gap-0.5 font-semibold">
                      <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                      <span className="truncate">ETB {etb(totalEarnedCents)} net earned</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <CalendarDays className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Upcoming Bookings</p>
              </div>
              <div className="mt-2 md:mt-4">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-green-400" />
                ) : (
                  <>
                    <h3 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-green-400">{upcomingGuestCount}</h3>
                    <p className="text-[9px] md:text-xs text-on-surface-variant dark:text-zinc-400 mt-1 font-medium">
                      {summary.upcoming} booking{summary.upcoming !== 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Active Experiences */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <Compass className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Live Experiences</p>
              </div>
              <div className="mt-2 md:mt-4">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-green-400" />
                ) : (
                  <>
                    <h3 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-green-400">{activeCount}</h3>
                    <p className="text-[9px] md:text-xs text-on-surface-variant dark:text-zinc-400 mt-1 font-medium">Open for booking</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-4 bg-primary-container dark:bg-[#064e3b] text-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: "#ffddb8" }} />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: "#ffddb8" }} />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <h4 className="text-xl font-headline font-bold mb-6 text-white">Quick Actions</h4>
              <div className="space-y-3">
                {listingLocked ? (
                  <div
                    className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl font-medium border border-white/10 text-sm opacity-50 cursor-not-allowed"
                    title="Listing changes are currently disabled for your account."
                  >
                    <span className="flex items-center gap-3"><PlusCircle className="h-4 w-4" />Create Experience</span>
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </div>
                ) : (
                  <Link to="/host/experiences/create"
                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm">
                    <span className="flex items-center gap-3"><PlusCircle className="h-4 w-4" />Create Experience</span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </Link>
                )}
                <Link to="/host/wallet"
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm">
                  <span className="flex items-center gap-3"><Wallet className="h-4 w-4" />Withdraw Funds</span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
                <Link to="/host/experiences"
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm">
                  <span className="flex items-center gap-3"><Clock className="h-4 w-4" />Manage Schedule</span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column content ────────────────────────── */}
        <div className="grid grid-cols-12 gap-4 md:gap-8">

          {/* Recent Bookings table */}
          <section className="col-span-12 xl:col-span-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] border border-outline-variant/10 dark:border-zinc-800">
              <div className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
                <h3 className="text-base md:text-xl font-headline font-bold text-primary dark:text-green-400">Recent Bookings</h3>
                <Link to="/host/bookings"
                  className="text-sm font-semibold text-primary dark:text-green-400 underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors">
                  View all
                </Link>
              </div>

              {bLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : bError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <AlertCircle className="h-8 w-8 text-error" />
                  <p className="text-sm text-on-surface-variant dark:text-zinc-400">Failed to load bookings.</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <CalendarDays className="h-10 w-10 text-on-surface-variant/30 dark:text-zinc-600 mb-3" />
                  <p className="font-bold text-on-surface dark:text-white mb-1">No bookings yet</p>
                  <p className="text-sm text-on-surface-variant dark:text-zinc-400">
                    Once guests book your experiences they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left min-w-[520px]">
                    <thead>
                      <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-4 md:px-8 py-4">Guest</th>
                        <th className="px-4 py-4">Experience</th>
                        <th className="px-4 py-4">Date</th>
                        <th className="px-4 py-4">Qty</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low dark:divide-zinc-800">
                      {recentBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-surface-container-low/40 dark:hover:bg-zinc-800/40 transition-colors">

                          {/* Guest */}
                          <td className="px-4 md:px-8 py-4">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar
                                name={b.user?.name ?? "Guest"}
                                photo={b.user?.photo}
                                className="w-8 h-8 rounded-full shrink-0 border border-outline-variant/20 dark:border-zinc-700 bg-secondary-container dark:bg-emerald-900/50"
                                initialsClassName="text-[10px] text-primary dark:text-green-400"
                                imgClassName="w-full h-full rounded-full object-cover"
                                alt={b.user?.name ?? ""}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-on-surface dark:text-white truncate max-w-[100px]">
                                  {b.user?.name ?? "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Experience */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-container dark:bg-zinc-700">
                                <img
                                  src={b.experience?.imageCover}
                                  alt={b.experience?.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/image1.jpg"; }}
                                />
                              </div>
                              <p className="text-xs font-bold text-primary dark:text-green-400 line-clamp-1 max-w-[140px]">
                                {b.experience?.title ?? "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-xs text-on-surface-variant dark:text-zinc-400 whitespace-nowrap">
                            {fmtDate(b.experienceDate ?? b.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-xs text-on-surface-variant dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{b.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle[b.status] ?? ""}`}>
                              {statusLabel[b.status] ?? b.status}
                            </span>
                          </td>
                          <td className="px-4 md:px-8 py-4 text-right font-bold text-primary dark:text-green-400 text-xs whitespace-nowrap">
                            {(b.price * b.quantity).toLocaleString()} <span className="font-normal text-on-surface-variant dark:text-zinc-400">ETB</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Right column */}
          <section className="col-span-12 xl:col-span-4 space-y-8">

            {/* Experience Performance */}
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] border border-outline-variant/10 dark:border-zinc-800">
              <h3 className="text-xl font-headline font-bold text-primary dark:text-green-400 mb-6">Experience Performance</h3>

              {eLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary dark:text-green-400" />
                </div>
              ) : performances.length === 0 ? (
                <div className="text-center py-6">
                  <Compass className="h-8 w-8 text-on-surface-variant/30 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant dark:text-zinc-400">No active experiences yet.</p>
                  {listingLocked ? (
                    <p className="mt-3 text-xs text-on-surface-variant dark:text-zinc-500">Creating experiences is currently disabled for your account.</p>
                  ) : (
                    <Link to="/host/experiences/create" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-green-400 hover:underline">
                      <PlusCircle className="h-3.5 w-3.5" /> Create one
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {performances.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-primary dark:text-green-400 leading-tight line-clamp-1 flex-1 pr-2">{p.name}</span>
                        {p.reviews > 0 && (
                          <span className="text-[11px] font-bold text-[#2a1700] bg-[#ffddb8] px-2 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                            {p.rating} <Star className="h-2.5 w-2.5 fill-[#2a1700]" />
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-surface-container-low dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="bg-primary dark:bg-green-500 h-full rounded-full transition-all duration-700" style={{ width: `${p.pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-on-surface-variant dark:text-zinc-400">
                          {p.bookings} booking{p.bookings !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-on-surface-variant dark:text-zinc-400">
                          {p.reviews} review{p.reviews !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/host/experiences"
                className="w-full mt-8 py-3 bg-surface-container-low dark:bg-zinc-800 hover:bg-surface-container-high dark:hover:bg-zinc-700 transition-colors rounded-xl text-xs font-bold text-primary dark:text-green-400 flex items-center justify-center">
                View All Experiences
              </Link>
            </div>

            {/* Host Tip card */}
            <div className="bg-tertiary-container dark:bg-[#3d2400] p-8 rounded-3xl relative overflow-hidden group border border-outline-variant/10 dark:border-zinc-800">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150 pointer-events-none">
                <Leaf className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: "#ffddb8" }} />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-[#ffddb8] text-[#2a1700] text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest">Host Tip</span>
                <h4 className="text-xl font-headline font-bold text-white mb-3">Grow Your Bookings</h4>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Experiences with at least 4 photos get <span className="text-[#ffddb8] font-bold">2.5×</span> more bookings. Keep your next date updated so guests can always find you.
                </p>
                <Link to="/host/experiences"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ffddb8] group-hover:gap-4 transition-all duration-200">
                  Manage Experiences <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </section>
        </div>
      </main>
    </HostLayout>
  );
}
