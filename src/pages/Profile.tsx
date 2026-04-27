import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Shield,
  Bell,
  LogOut,
  Camera,
  Key,
  Smartphone,
  Laptop,
  Mail,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  BookOpen,
  LayoutDashboard,
  Compass,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import type { User as AuthUser } from "@/services/auth.service";
import { bookingsService, type Booking } from "@/services/bookings.service";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── types ─────────────────────────────────────────────── */
type Tab = "personal" | "security" | "notifications" | "bookings";

function apiErrMessage(e: unknown): string {
  return getFriendlyErrorMessage(e);
}

function formatBookingDate(iso?: string) {
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

function bookingExperienceTitle(b: Booking) {
  const ex = b.experience;
  if (ex && typeof ex === "object" && "title" in ex) return ex.title;
  return "Experience";
}

/** Non-interactive toggle preview for “coming soon” sections */
function ToggleDisabled({ checked = false }: { checked?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full pointer-events-none opacity-45 ${
        checked ? "bg-primary/60" : "bg-surface-container"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white/90 shadow mt-0.5 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function ComingSoonBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/35 px-3.5 py-2.5 ${className}`}
    >
      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-headline font-bold text-amber-950 dark:text-amber-100">Coming soon</p>
        <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-snug mt-0.5">
          This feature isn&apos;t wired up yet. Settings here are disabled until we ship it.
        </p>
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [mobileView, setMobileView] = useState<"menu" | Tab>("menu");
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const displayName = user?.name ?? "";
  const isAdmin = user?.role === "admin";
  const isHost = user?.hostStatus === "approved" || isAdmin;

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "personal", icon: <User className="h-4 w-4" />, label: "Personal Info" },
    { id: "bookings", icon: <BookOpen className="h-4 w-4" />, label: "My Bookings" },
    { id: "security", icon: <Shield className="h-4 w-4" />, label: "Security" },
    { id: "notifications", icon: <Bell className="h-4 w-4" />, label: "Notifications" },
  ];

  const contentProps = {
    user,
    updateUser,
    showPass,
    setShowPass,
    showNewPass,
    setShowNewPass,
    deleteConfirm,
    setDeleteConfirm,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14 pb-16 max-w-6xl mx-auto">
        <div className="md:hidden">
          {mobileView === "menu" && (
            <div className="px-4 pt-5 pb-10 space-y-4">
              <div className="bg-primary rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-primary/20">
                <UserAvatar
                  name={displayName || "User"}
                  photo={user?.photo}
                  className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/20"
                  initialsClassName="text-white text-xl font-black"
                  imgClassName="w-full h-full object-cover"
                  alt=""
                />
                <div className="min-w-0">
                  <p className="font-headline font-extrabold text-white text-base truncate">{displayName}</p>
                  <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-1.5 bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
                  </span>
                </div>
              </div>

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
                    <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white flex items-center gap-1.5 flex-wrap">
                      {item.label}
                      {item.id === "notifications" && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                          Soon
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                  </button>
                ))}
              </div>

              {(isHost || isAdmin) && (
                <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 pt-3 pb-1">
                    Portals
                  </p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">
                        Admin Dashboard
                      </span>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                    </Link>
                  )}
                  {isHost && !isAdmin && (
                    <Link
                      to="/host-dashboard"
                      className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-green-400 shrink-0">
                        <Compass className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">
                        Host Dashboard
                      </span>
                      <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
                    </Link>
                  )}
                </div>
              )}

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

          {mobileView !== "menu" && (
            <div className="px-4 pt-4 pb-10 space-y-4">
              <button
                onClick={() => setMobileView("menu")}
                className="flex items-center gap-2 text-primary font-headline font-bold text-sm mb-1 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </button>
              <ProfileContent {...contentProps} activeTab={mobileView as Tab} />
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-row gap-6 px-4 pt-6">
          <aside className="w-56 shrink-0">
            <div className="sticky top-16 bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-5 px-1">
                <UserAvatar
                  name={displayName || "User"}
                  photo={user?.photo}
                  className="w-10 h-10 rounded-full bg-secondary-container text-sm"
                  initialsClassName="text-on-secondary-container text-sm"
                  imgClassName="w-full h-full rounded-full object-cover"
                  alt=""
                />
                <div className="min-w-0">
                  <p className="font-headline font-bold text-primary text-sm truncate">{displayName}</p>
                  <p className="text-[10px] text-on-surface-variant capitalize">
                    {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
                  </p>
                </div>
              </div>

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
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {item.label}
                      {item.id === "notifications" && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                          Soon
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </nav>

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
                  {isHost && !isAdmin && (
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

          <div className="flex-1 space-y-6 min-w-0">
            <ProfileContent {...contentProps} activeTab={activeTab} />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Shared content renderer
───────────────────────────────────────────────────────── */
interface ContentProps {
  activeTab: Tab;
  user: AuthUser | null;
  updateUser: (u: AuthUser) => void;
  showPass: boolean;
  setShowPass: Dispatch<SetStateAction<boolean>>;
  showNewPass: boolean;
  setShowNewPass: Dispatch<SetStateAction<boolean>>;
  deleteConfirm: boolean;
  setDeleteConfirm: (v: boolean) => void;
}

function ProfileContent({
  activeTab,
  user,
  updateUser,
  showPass,
  setShowPass,
  showNewPass,
  setShowNewPass,
  deleteConfirm,
  setDeleteConfirm,
}: ContentProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [hostStory, setHostStory] = useState(user?.hostStory ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setBio(user.bio ?? "");
    setHostStory(user.hostStory ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const authProvider = user?.authProvider ?? "local";
  const canChangePassword = authProvider === "local";
  const googleLinked = !!(user?.googleId) || authProvider === "google";

  const { data: bookingsPreview, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings-profile-preview"],
    queryFn: async () => {
      const res = await bookingsService.getMyBookings({ page: 1, limit: 5 });
      return res.data;
    },
    enabled: activeTab === "bookings",
  });

  const previewList = bookingsPreview?.data ?? [];
  const previewTotal = bookingsPreview?.total ?? 0;

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await authService.updateMe({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        ...(user.hostStatus === "approved" ? { hostStory: hostStory.trim() } : {}),
      });
      updateUser(res.data.data.user);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(apiErrMessage(e));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploadingPhoto(true);
    try {
      const res = await authService.uploadProfilePhoto(file);
      updateUser(res.data.data.user);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(apiErrMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!canChangePassword) return;
    if (passwordNew !== passwordConfirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordNew.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await authService.updatePassword({
        passwordCurrent,
        password: passwordNew,
        passwordConfirm,
      });
      updateUser(res.data.data.user);
      setPasswordCurrent("");
      setPasswordNew("");
      setPasswordConfirm("");
      toast.success("Password updated");
    } catch (e) {
      toast.error(apiErrMessage(e));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setDeletingAccount(true);
    try {
      await authService.deleteMe();
      toast.success("Your account has been deactivated.");
      logout();
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(apiErrMessage(e));
    } finally {
      setDeletingAccount(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {activeTab === "personal" && (
        <>
          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">Personal Information</h2>
                <p className="text-on-surface-variant text-xs">Update your photo and personal details.</p>
              </div>
              <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1">
                <Compass className="h-3 w-3 shrink-0" aria-hidden />
                Traveler
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelected}
            />

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                <UserAvatar
                  name={user?.name ?? "User"}
                  photo={user?.photo}
                  className="w-24 h-24 rounded-2xl bg-surface-container border-4 border-background shadow-sm"
                  initialsClassName="text-primary text-3xl font-black"
                  imgClassName="w-full h-full object-cover rounded-2xl"
                  alt={user?.name ?? ""}
                />
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-md hover:scale-110 transition-transform disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    WhatsApp / Phone
                    {user?.hostStatus === "approved" && (
                      <span className="ml-1.5 text-[10px] font-normal text-primary dark:text-green-400">(shown to guests who book your experience)</span>
                    )}
                  </label>
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(ev) => setPhone(ev.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      className="w-full pl-9 text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">Use international format, e.g. +251912345678</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(ev) => setBio(ev.target.value.slice(0, 500))}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell others a bit about you…"
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">{bio.length}/500</p>
                </div>
                {user?.hostStatus === "approved" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                      Host story <span className="font-normal text-on-surface-variant/80">(gist)</span>
                    </label>
                    <p className="text-[11px] text-on-surface-variant mb-2 leading-relaxed">
                      A short, personal blurb guests see on your experience pages—why you host, what you love sharing. Keep it authentic and concise.
                    </p>
                    <textarea
                      value={hostStory}
                      onChange={(ev) => setHostStory(ev.target.value.slice(0, 400))}
                      rows={3}
                      maxLength={400}
                      placeholder="e.g. I grew up in Addis and want every guest to taste real home-style injera and hear the stories behind each dish…"
                      className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-1">{hostStory.length}/400</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="bg-primary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[0.99] transition-transform shadow-md shadow-primary/20 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
            <h2 className="font-headline font-extrabold text-lg text-primary mb-4">Linked Accounts</h2>
            <p className="text-xs text-on-surface-variant mb-2">
              {authProvider === "google" && "You sign in with Google."}
              {authProvider === "facebook" &&
                "Your account was linked with Facebook. Sign-in with Facebook is no longer available. Use forgot password on the login page to set an email password, or contact support."}
              {authProvider === "local" && "You sign in with email and password."}
            </p>
            <p className="text-[11px] text-on-surface-variant mb-4 leading-relaxed">
              To <strong>link</strong> Google, use the button below and sign in with a provider that uses the{" "}
              <strong>same email</strong> as this account. You&apos;ll return here with an updated session.
            </p>
            <div className="flex flex-wrap gap-3">
              {googleLinked ? (
                <div className="flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold text-on-surface">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google connected
                </div>
              ) : (
                <a
                  href={`${API_BASE}/auth/google`}
                  className="inline-flex items-center gap-2.5 border border-outline-variant/40 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Connect Google
                </a>
              )}
            </div>
          </section>

          <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-800/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-extrabold text-lg text-red-600 mb-0.5">Deactivate account</h2>
                <p className="text-on-surface-variant text-xs">
                  Your account is hidden and you won&apos;t be able to sign in again. Some records may be kept for legal
                  or operational reasons (soft delete).
                </p>
              </div>
              {!deleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-red-600 text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Deactivate my account
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={deletingAccount}
                    onClick={handleDeactivateAccount}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white font-headline font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60"
                  >
                    {deletingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
                    Yes, deactivate
                  </button>
                  <button
                    type="button"
                    disabled={deletingAccount}
                    onClick={() => setDeleteConfirm(false)}
                    className="text-on-surface-variant text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-[11px] text-red-600/80 dark:text-red-400/90 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              This calls the server to mark your account inactive. You will be signed out immediately.
            </p>
          </section>
        </>
      )}

      {activeTab === "security" && (
        <>
          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Key className="h-4 w-4 text-on-tertiary-container" />
              <h2 className="font-headline font-extrabold text-lg text-primary">Change Password</h2>
            </div>
            {!canChangePassword ? (
              <p className="text-sm text-on-surface-variant max-w-md">
                Password change is only available for accounts that use email and password. OAuth accounts use your
                provider to sign in.
              </p>
            ) : (
              <div className="space-y-3 max-w-sm">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Current password"
                    value={passwordCurrent}
                    onChange={(ev) => setPasswordCurrent(ev.target.value)}
                    autoComplete="current-password"
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="New password (min. 8 characters)"
                    value={passwordNew}
                    onChange={(ev) => setPasswordNew(ev.target.value)}
                    autoComplete="new-password"
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordConfirm}
                    onChange={(ev) => setPasswordConfirm(ev.target.value)}
                    autoComplete="new-password"
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={savingPassword}
                  onClick={handleUpdatePassword}
                  className="bg-primary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[0.99] transition-transform shadow-md shadow-primary/20 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-background/40 dark:bg-black/20 pointer-events-none z-[1]" aria-hidden />
            <div className="relative z-[2] space-y-3">
              <ComingSoonBanner />
              <div className="flex items-center justify-between gap-3 opacity-55 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-on-tertiary-container" />
                  <h2 className="font-headline font-extrabold text-lg text-primary">Two-Factor Authentication</h2>
                </div>
                <ToggleDisabled checked={false} />
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed max-w-md opacity-55 pointer-events-none select-none">
                Add an extra step at sign-in with a code from an authenticator app or SMS. We&apos;ll enable this in a
                future release.
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-background/40 dark:bg-black/20 pointer-events-none z-[1]" aria-hidden />
            <div className="relative z-[2] space-y-3">
              <ComingSoonBanner />
              <div className="flex items-center gap-2 opacity-55 pointer-events-none select-none">
                <Laptop className="h-4 w-4 text-on-tertiary-container" />
                <h2 className="font-headline font-extrabold text-lg text-primary">Active Sessions</h2>
              </div>
              <p className="text-xs text-on-surface-variant opacity-55 pointer-events-none select-none mb-2">
                See where you&apos;re signed in and revoke access from other devices.
              </p>
              <div className="space-y-3 opacity-50 pointer-events-none select-none">
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-lg flex items-center justify-center shadow-sm">
                      <Laptop className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-sm text-primary">This device — preview</p>
                      <p className="text-[11px] text-on-surface-variant">Session list coming soon</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Disabled</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "notifications" && (
        <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-background/35 dark:bg-black/15 pointer-events-none z-[1]" aria-hidden />
          <div className="relative z-[2]">
            <h2 className="font-headline font-extrabold text-lg text-primary mb-3">Notification Preferences</h2>
            <ComingSoonBanner className="mb-5" />
            <p className="text-xs text-on-surface-variant mb-4 opacity-70">
              Choose how we reach you about bookings, messages, and updates. Controls below are a preview only.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-none select-none opacity-55">
              {[
                {
                  icon: <Mail className="h-4 w-4 text-primary" />,
                  title: "Email",
                  items: ["New Bookings", "Direct Messages"],
                },
                {
                  icon: <MessageSquare className="h-4 w-4 text-primary" />,
                  title: "SMS",
                  items: ["Booking Reminders", "Security Alerts"],
                },
                {
                  icon: <Bell className="h-4 w-4 text-primary" />,
                  title: "Push",
                  items: ["Nearby Experiences", "App Updates"],
                },
              ].map((group) => (
                <div key={group.title} className="bg-surface-container-low rounded-xl p-4 space-y-3 ring-1 ring-outline-variant/20">
                  <div className="flex items-center gap-2 mb-1">
                    {group.icon}
                    <span className="font-headline font-bold text-sm text-primary">{group.title}</span>
                  </div>
                  {group.items.map((label) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-on-surface-variant">{label}</span>
                      <ToggleDisabled checked={false} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "bookings" && (
        <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">My Bookings</h2>
              <p className="text-on-surface-variant dark:text-zinc-400 text-xs">
                {previewTotal === 0
                  ? "No bookings yet."
                  : `${previewTotal} total — showing recent below.`}
              </p>
            </div>
            {previewTotal > 0 && (
              <Link
                to="/my-bookings"
                className="text-xs font-bold text-primary dark:text-green-400 hover:underline underline-offset-4 shrink-0"
              >
                View All
              </Link>
            )}
          </div>

          {bookingsLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-on-surface-variant" />
            </div>
          )}

          {!bookingsLoading && previewList.length === 0 && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              You don&apos;t have any bookings yet.{" "}
              <Link to="/experiences" className="font-bold text-primary">
                Explore experiences
              </Link>
            </p>
          )}

          {!bookingsLoading && previewList.length > 0 && (
            <div className="space-y-3">
              {previewList.map((b) => {
                const statusStyle =
                  b.status === "upcoming"
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    : b.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-green-400"
                      : b.status === "cancelled"
                        ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
                return (
                  <div
                    key={b._id}
                    className="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface dark:text-white truncate">
                        {bookingExperienceTitle(b)}
                      </p>
                      <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                        {formatBookingDate(b.experienceDate ?? b.createdAt)} · {b.quantity} guest
                        {b.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
                        {b.status}
                      </span>
                      <span className="text-xs font-bold text-primary dark:text-green-400">
                        ETB {typeof b.price === "number" ? b.price.toLocaleString() : b.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {previewTotal > 0 && (
            <div className="mt-4 text-center">
              <Link
                to="/my-bookings"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-green-400 hover:underline underline-offset-4"
              >
                View all bookings →
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
