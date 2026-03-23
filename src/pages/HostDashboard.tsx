import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, CalendarDays, Compass, TrendingUp, TrendingDown,
  PlusCircle, Wallet, Clock, ChevronRight, Star, ArrowRight,
  Users, Leaf,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";

/* ─── mock data ──────────────────────────────────────── */
type BookingStatus = "Confirmed" | "Pending" | "Completed";

const recentBookings = [
  {
    id: "1",
    exp: "Highland Coffee Ceremony",
    image: "/imgs/hero-2.jpg",
    date: "Oct 12, 2023",
    guests: 4,
    status: "Confirmed" as BookingStatus,
    total: "2,400",
  },
  {
    id: "2",
    exp: "Simien Peaks Trek",
    image: "/imgs/hero-1.jpg",
    date: "Oct 14, 2023",
    guests: 2,
    status: "Pending" as BookingStatus,
    total: "4,850",
  },
  {
    id: "3",
    exp: "Gourmet Injera Workshop",
    image: "/imgs/hero-3.jpg",
    date: "Oct 10, 2023",
    guests: 5,
    status: "Completed" as BookingStatus,
    total: "3,100",
  },
];

const performances = [
  { name: "Highland Coffee Ceremony", bookings: 24, rating: 4.9, pct: 92, trend: "+14%" },
  { name: "Simien Peaks Trek",        bookings: 18, rating: 4.8, pct: 78, trend: "+8%" },
  { name: "Gourmet Injera Workshop",  bookings: 12, rating: 4.7, pct: 65, trend: "-2%" },
];

const statusStyle: Record<BookingStatus, string> = {
  Confirmed: "bg-secondary-container text-on-secondary-fixed-variant dark:bg-emerald-900/40 dark:text-emerald-300",
  Pending:   "bg-[#ffddb8] text-[#2a1700] dark:bg-amber-800/40 dark:text-amber-300",
  Completed: "bg-surface-container-high text-on-surface-variant dark:bg-zinc-700 dark:text-zinc-300",
};

/* ─── component ──────────────────────────────────────── */
export default function HostDashboard() {
  const [search, setSearch] = useState("");

  return (
    <HostLayout
      hostName="Selamawit T."
      hostInitials="ST"
      hostTitle="Superhost"
      searchValue={search}
      onSearch={setSearch}
    >
      <main className="p-4 md:p-10 max-w-[1440px]">

        {/* ── Welcome ──────────────────────────────────── */}
        <header className="mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight mb-2">
            Welcome back, Selamawit!
          </h2>
          <p className="text-on-surface-variant dark:text-zinc-400 text-sm md:text-base">
            Your Ethiopian highlands experiences are flourishing this season.
          </p>
        </header>

        {/* ── Stats + Quick Actions bento ──────────────── */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-6 md:mb-12">

          {/* Stats row */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-2 md:gap-6">
            {/* Earnings */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <Banknote className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Total Earnings</p>
              </div>
              <div className="mt-2 md:mt-4">
                <h3 className="text-base md:text-2xl font-headline font-bold text-primary dark:text-green-400 leading-tight">
                  14,250 <span className="text-[10px] md:text-sm font-normal text-on-surface-variant dark:text-zinc-400">ETB</span>
                </h3>
                <p className="text-[9px] md:text-xs text-primary-container dark:text-green-500 mt-1 flex items-center gap-0.5 font-semibold">
                  <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                  <span className="truncate">+12% last mo.</span>
                </p>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <CalendarDays className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Upcoming</p>
              </div>
              <div className="mt-2 md:mt-4">
                <h3 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-green-400">8</h3>
                <p className="text-[9px] md:text-xs text-on-surface-variant dark:text-zinc-400 mt-1 font-medium">Next 7 days</p>
              </div>
            </div>

            {/* Active Experiences */}
            <div className="bg-white dark:bg-zinc-900 p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] flex flex-col justify-between border border-outline-variant/10 dark:border-zinc-800">
              <div>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 flex items-center justify-center mb-2 md:mb-4">
                  <Compass className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary dark:text-green-400" />
                </div>
                <p className="text-[8px] md:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider leading-tight">Active Exp.</p>
              </div>
              <div className="mt-2 md:mt-4">
                <h3 className="text-2xl md:text-4xl font-headline font-bold text-primary dark:text-green-400">3</h3>
                <p className="text-[9px] md:text-xs text-on-surface-variant dark:text-zinc-400 mt-1 font-medium">Live & booking</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-4 bg-primary-container dark:bg-[#064e3b] text-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-xl relative overflow-hidden">
            {/* decorative blobs */}
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: "#ffddb8" }} />
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: "#ffddb8" }} />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <h4 className="text-xl font-headline font-bold mb-6 text-white">Quick Actions</h4>
              <div className="space-y-3">
                <Link
                  to="/host/experiences/create"
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <PlusCircle className="h-4 w-4" />
                    Create Experience
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
                <Link
                  to="/host/wallet"
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Wallet className="h-4 w-4" />
                    Withdraw Funds
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
                <Link
                  to="/host/experiences"
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-medium border border-white/15 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    Manage Schedule
                  </span>
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
                <Link
                  to="/my-bookings"
                  className="text-sm font-semibold text-primary dark:text-green-400 underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[520px]">
                  <thead>
                    <tr className="bg-surface-container-low dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-4 md:px-8 py-4">Experience</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Guests</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low dark:divide-zinc-800">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container-low/40 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container dark:bg-zinc-700">
                              <img
                                src={b.image}
                                alt={b.exp}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <p className="text-sm font-bold text-primary dark:text-green-400">{b.exp}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-sm text-on-surface-variant dark:text-zinc-400">{b.date}</td>
                        <td className="px-4 py-5 text-sm text-on-surface-variant dark:text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {b.guests}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle[b.status]}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-primary dark:text-green-400 text-sm">
                          {b.total} <span className="font-normal text-on-surface-variant dark:text-zinc-400 text-xs">ETB</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right column */}
          <section className="col-span-12 xl:col-span-4 space-y-8">

            {/* Experience Performance */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,53,39,0.06)] border border-outline-variant/10 dark:border-zinc-800">
              <h3 className="text-xl font-headline font-bold text-primary dark:text-green-400 mb-6">Experience Performance</h3>
              <div className="space-y-6">
                {performances.map((p) => {
                  const isPositive = p.trend.startsWith("+");
                  return (
                    <div key={p.name}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-primary dark:text-green-400 leading-tight">{p.name}</span>
                        <span className="text-[11px] font-bold text-[#2a1700] bg-[#ffddb8] px-2 py-0.5 rounded shrink-0 ml-2">
                          {p.rating} ★
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-low dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="bg-primary dark:bg-green-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-on-surface-variant dark:text-zinc-400">
                          {p.bookings} bookings this month
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isPositive ? "text-primary dark:text-green-400" : "text-error dark:text-red-400"}`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {p.trend}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-8 py-3 bg-surface-container-low dark:bg-zinc-800 hover:bg-surface-container-high dark:hover:bg-zinc-700 transition-colors rounded-xl text-xs font-bold text-primary dark:text-green-400">
                View Detailed Analytics
              </button>
            </div>

            {/* Host Tip card */}
            <div className="bg-tertiary-container dark:bg-[#3d2400] p-8 rounded-3xl relative overflow-hidden group border border-outline-variant/10 dark:border-zinc-800">
              {/* decorative icon */}
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150 pointer-events-none">
                <Leaf className="h-24 w-24 text-white" />
              </div>
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: "#ffddb8" }} />

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-[#ffddb8] text-[#2a1700] text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest">
                  Host Tip
                </span>
                <h4 className="text-xl font-headline font-bold text-white mb-3">Maximize Peak Season</h4>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  The Ethiopian summer brings more hikers. Update your availability for Simien treks to capture 20% more bookings.
                </p>
                <Link
                  to="/host/experiences"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ffddb8] group-hover:gap-4 transition-all duration-200"
                >
                  Update Schedule
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </section>
        </div>
      </main>
    </HostLayout>
  );
}
