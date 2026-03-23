import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Shield, Bell, LogOut,
  Camera, Key, Smartphone, Laptop, Mail, MessageSquare,
  Trash2, Eye, EyeOff, AlertTriangle,
  BookOpen, LayoutDashboard, Compass, ChevronRight, ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import type { User as AuthUser } from "@/services/auth.service";

/* ─── types ─────────────────────────────────────────────── */
type Tab = "personal" | "security" | "notifications" | "bookings";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── toggle component ──────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-primary" : "bg-surface-container"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ─── page ──────────────────────────────────────────────── */
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]     = useState<Tab>("personal");
  // mobile navigation: "menu" = settings list, or the active tab key
  const [mobileView, setMobileView]   = useState<"menu" | Tab>("menu");
  const [showPass, setShowPass]       = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFa, setTwoFa]             = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const displayName = user?.name ?? "";
  const initials    = getInitials(displayName);
  const isAdmin     = user?.role === "admin";
  const isHost      = user?.hostStatus === "approved" || isAdmin;

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  /* notification prefs */
  const [notifs, setNotifs] = useState({
    emailBookings: true, emailMessages: true,
    smsReminders: false, smsAlerts: false,
    pushNearby: true, pushUpdates: true,
  });
  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [k]: !n[k] }));

  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "personal",      icon: <User className="h-4 w-4" />,      label: "Personal Info" },
    { id: "bookings",      icon: <BookOpen className="h-4 w-4" />,  label: "My Bookings" },
    { id: "security",      icon: <Shield className="h-4 w-4" />,    label: "Security" },
    { id: "notifications", icon: <Bell className="h-4 w-4" />,      label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14 pb-16 max-w-6xl mx-auto">

        {/* ══════════════════════════════════════
            MOBILE LAYOUT  (hidden on md+)
        ══════════════════════════════════════ */}
        <div className="md:hidden">

          {/* ── Mobile menu screen ── */}
          {mobileView === "menu" && (
            <div className="px-4 pt-5 pb-10 space-y-4">

              {/* User hero card */}
              <div className="bg-primary rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-primary/20">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center font-headline font-black text-white text-xl shrink-0 border-2 border-white/20">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-headline font-extrabold text-white text-base truncate">{displayName}</p>
                  <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-1.5 bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
                  </span>
                </div>
              </div>

              {/* Settings rows */}
              <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
                {navItems.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setMobileView(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-4 text-left transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 ${
                      i < navItems.length - 1 ? "border-b border-outline-variant/10 dark:border-zinc-700" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-green-400 shrink-0">
                      {item.icon}
                    </div>
                    <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                  </button>
                ))}
              </div>

              {/* Portals */}
              {(isHost || isAdmin) && (
                <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 pt-3 pb-1">Portals</p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">Admin Dashboard</span>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                    </Link>
                  )}
                  {isHost && (
                    <Link
                      to="/host-dashboard"
                      className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Compass className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">Host Dashboard</span>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                    </Link>
                  )}
                </div>
              )}

              {/* Sign out */}
              <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-4 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-headline font-semibold text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Mobile content screen ── */}
          {mobileView !== "menu" && (
            <div className="px-4 pt-4 pb-10 space-y-4">
              {/* Back header */}
              <button
                onClick={() => setMobileView("menu")}
                className="flex items-center gap-2 text-primary font-headline font-bold text-sm mb-1 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </button>
              {/* Render the active section — pass mobileView as the tab */}
              <ProfileContent
                activeTab={mobileView}
                user={user}
                showPass={showPass} setShowPass={setShowPass}
                showNewPass={showNewPass} setShowNewPass={setShowNewPass}
                twoFa={twoFa} setTwoFa={setTwoFa}
                deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
                notifs={notifs} toggleNotif={toggleNotif}
              />
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            DESKTOP LAYOUT  (hidden on mobile)
        ══════════════════════════════════════ */}
        <div className="hidden md:flex flex-row gap-6 px-4 pt-6">

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0">
            <div className="sticky top-16 bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm p-4">

              {/* User summary */}
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-on-secondary-container text-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-headline font-bold text-primary text-sm truncate">{displayName}</p>
                  <p className="text-[10px] text-on-surface-variant capitalize">
                    {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
                  </p>
                </div>
              </div>

              {/* Main nav tabs */}
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-headline font-semibold transition-all ${
                      activeTab === item.id
                        ? "bg-primary/8 text-primary dark:bg-primary/15"
                        : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-zinc-700 hover:translate-x-0.5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Role-based dashboard links */}
              {(isHost || isAdmin) && (
                <div className="mt-4 pt-4 border-t border-outline-variant/20 dark:border-zinc-600 space-y-0.5">
                  <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-500 uppercase tracking-widest px-3 mb-2">
                    Portals
                  </p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-primary dark:text-green-400 hover:bg-primary/8 dark:hover:bg-primary/15 transition-all hover:translate-x-0.5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  {isHost && (
                    <Link
                      to="/host-dashboard"
                      className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-primary dark:text-green-400 hover:bg-primary/8 dark:hover:bg-primary/15 transition-all hover:translate-x-0.5"
                    >
                      <Compass className="h-4 w-4" />
                      Host Dashboard
                    </Link>
                  )}
                </div>
              )}

              {/* Sign out */}
              <div className="mt-4 pt-4 border-t border-outline-variant/20 dark:border-zinc-600">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 space-y-6 min-w-0">
            <ProfileContent
              activeTab={activeTab}
              user={user}
              showPass={showPass} setShowPass={setShowPass}
              showNewPass={showNewPass} setShowNewPass={setShowNewPass}
              twoFa={twoFa} setTwoFa={setTwoFa}
              deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
              notifs={notifs} toggleNotif={toggleNotif}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Shared content renderer used by both mobile & desktop
───────────────────────────────────────────────────────── */
interface ContentProps {
  activeTab: Tab;
  user: AuthUser | null;
  showPass: boolean; setShowPass: (v: boolean) => void;
  showNewPass: boolean; setShowNewPass: (v: boolean) => void;
  twoFa: boolean; setTwoFa: (v: boolean) => void;
  deleteConfirm: boolean; setDeleteConfirm: (v: boolean) => void;
  notifs: Record<string, boolean>;
  toggleNotif: (k: string) => void;
}

function ProfileContent({
  activeTab, user, showPass, setShowPass, showNewPass, setShowNewPass,
  twoFa, setTwoFa, deleteConfirm, setDeleteConfirm, notifs, toggleNotif,
}: ContentProps) {
  const initials = getInitials(user?.name ?? "");
  return (
    <div className="space-y-6">
            {/* ── Personal Info ── */}
            {activeTab === "personal" && (
              <>
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">Personal Information</h2>
                      <p className="text-on-surface-variant text-xs">Update your photo and personal details.</p>
                    </div>
                    <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1">
                      ★ Traveler
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-surface-container overflow-hidden border-4 border-background shadow-sm flex items-center justify-center">
                        {user?.photo ? (
                          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-headline font-black text-3xl text-primary">{initials}</span>
                        )}
                      </div>
                      <button className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-md hover:scale-110 transition-transform">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {[
                        { label: "Full Name",     type: "text",  defaultValue: user?.name  ?? "" },
                        { label: "Email Address", type: "email", defaultValue: user?.email ?? "" },
                      ].map(({ label, type, defaultValue }) => (
                        <div key={label}>
                          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{label}</label>
                          <input
                            type={type}
                            defaultValue={defaultValue}
                            className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Bio</label>
                        <textarea
                          defaultValue="Passionate explorer of Ethiopian highlands and traditional artisan crafts."
                          rows={3}
                          className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-5">
                    <button className="bg-primary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[0.99] transition-transform shadow-md shadow-primary/20">
                      Save Changes
                    </button>
                  </div>
                </section>

                {/* Linked accounts */}
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <h2 className="font-headline font-extrabold text-lg text-primary mb-4">Linked Accounts</h2>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2.5 border border-outline-variant/40 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Connected with Google
                    </button>
                    <button className="flex items-center gap-2.5 bg-[#1877F2] text-white px-4 py-2.5 rounded-xl text-sm font-headline font-semibold hover:opacity-90 transition-opacity">
                      <svg className="h-4 w-4" fill="white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Link Facebook
                    </button>
                  </div>
                </section>

                {/* Delete account */}
                <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-800/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-headline font-extrabold text-lg text-red-600 mb-0.5">Delete Account</h2>
                      <p className="text-on-surface-variant text-xs">Permanently remove your account and all data. This is irreversible.</p>
                    </div>
                    {!deleteConfirm ? (
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="flex items-center gap-2 bg-red-600 text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 font-semibold">Are you sure?</span>
                        <button className="bg-red-600 text-white font-bold text-xs px-3 py-2 rounded-lg hover:opacity-90">
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          className="text-on-surface-variant text-xs font-bold px-3 py-2 rounded-lg hover:bg-surface-container"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    You will be asked to confirm your password before deletion.
                  </p>
                </section>
              </>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <>
                {/* Change password */}
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <Key className="h-4 w-4 text-on-tertiary-container" />
                    <h2 className="font-headline font-extrabold text-lg text-primary">Change Password</h2>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Current password"
                        className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        placeholder="New password (min. 8 characters)"
                        className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button className="bg-primary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[0.99] transition-transform shadow-md shadow-primary/20">
                      Update Password
                    </button>
                  </div>
                </section>

                {/* 2FA */}
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-on-tertiary-container" />
                      <h2 className="font-headline font-extrabold text-lg text-primary">Two-Factor Auth</h2>
                    </div>
                    <Toggle checked={twoFa} onChange={setTwoFa} />
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed max-w-md">
                    Secure your account by requiring an additional code sent to your mobile device whenever you log in.
                  </p>
                </section>

                {/* Active sessions */}
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Laptop className="h-4 w-4 text-on-tertiary-container" />
                    <h2 className="font-headline font-extrabold text-lg text-primary">Active Sessions</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: <Laptop className="h-4 w-4 text-primary" />, name: "MacBook Pro", location: "Addis Ababa, ET", status: "Active now", browser: "Safari" },
                      { icon: <Smartphone className="h-4 w-4 text-primary" />, name: "iPhone 14", location: "Dire Dawa, ET", status: "Last active: 2 hours ago", browser: "Chrome" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {s.icon}
                          </div>
                          <div>
                            <p className="font-headline font-bold text-sm text-primary">{s.name} — {s.location}</p>
                            <p className="text-[11px] text-on-surface-variant">{s.status} · {s.browser}</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-primary hover:underline">Revoke</button>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                <h2 className="font-headline font-extrabold text-lg text-primary mb-5">Notification Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: <Mail className="h-4 w-4 text-primary" />,
                      title: "Email",
                      items: [
                        { label: "New Bookings",    key: "emailBookings" as const },
                        { label: "Direct Messages", key: "emailMessages" as const },
                      ],
                    },
                    {
                      icon: <MessageSquare className="h-4 w-4 text-primary" />,
                      title: "SMS",
                      items: [
                        { label: "Booking Reminders", key: "smsReminders" as const },
                        { label: "Security Alerts",   key: "smsAlerts" as const },
                      ],
                    },
                    {
                      icon: <Bell className="h-4 w-4 text-primary" />,
                      title: "Push",
                      items: [
                        { label: "Nearby Experiences", key: "pushNearby" as const },
                        { label: "App Updates",        key: "pushUpdates" as const },
                      ],
                    },
                  ].map((group) => (
                    <div key={group.title} className="bg-surface-container-low rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        {group.icon}
                        <span className="font-headline font-bold text-sm text-primary">{group.title} Notifications</span>
                      </div>
                      {group.items.map((item) => (
                        <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                            {item.label}
                          </span>
                          <Toggle checked={notifs[item.key]} onChange={() => toggleNotif(item.key)} />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── My Bookings ── */}
            {activeTab === "bookings" && (
              <>
                <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">My Bookings</h2>
                      <p className="text-on-surface-variant dark:text-zinc-400 text-xs">All your past and upcoming experience bookings.</p>
                    </div>
                    <Link
                      to="/my-bookings"
                      className="text-xs font-bold text-primary dark:text-green-400 hover:underline underline-offset-4"
                    >
                      View All
                    </Link>
                  </div>

                  {/* summary cards */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Upcoming",  value: 2, color: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-900/20" },
                      { label: "Completed", value: 5, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                      { label: "Expired",   value: 1, color: "text-zinc-500 dark:text-zinc-400",    bg: "bg-zinc-100 dark:bg-zinc-800" },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-headline font-black ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-semibold mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* recent bookings preview */}
                  <div className="space-y-3">
                    {[
                      { exp: "Highland Coffee Ceremony", date: "Mar 15, 2026", guests: 2, status: "upcoming",  price: "1,300" },
                      { exp: "Simien Peaks Trek",        date: "Feb 22, 2026", guests: 1, status: "upcoming",  price: "1,200" },
                      { exp: "Gourmet Injera Workshop",  date: "Jan 10, 2026", guests: 3, status: "completed", price: "1,500" },
                    ].map((b, i) => {
                      const statusStyle =
                        b.status === "upcoming"  ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" :
                        b.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl hover:shadow-sm transition-shadow">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-primary dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface dark:text-white truncate">{b.exp}</p>
                            <p className="text-xs text-on-surface-variant dark:text-zinc-400">{b.date} · {b.guests} guest{b.guests > 1 ? "s" : ""}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>{b.status}</span>
                            <span className="text-xs font-bold text-primary dark:text-green-400">ETB {b.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-center">
                    <Link
                      to="/my-bookings"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-green-400 hover:underline underline-offset-4"
                    >
                      View all bookings →
                    </Link>
                  </div>
                </section>
              </>
            )}
    </div>
  );
}
