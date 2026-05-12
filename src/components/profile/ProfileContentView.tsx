import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Camera,
  Compass,
  Eye,
  EyeOff,
  Key,
  Laptop,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  ProfileComingSoonBanner,
  ProfileToggleDisabled,
} from "@/components/profile/ProfileComingSoonUi";
import {
  bookingExperienceTitle,
  formatBookingDate,
  type ProfileTab,
} from "@/components/profile/profileUtils";
import { UserAvatar } from "@/components/UserAvatar";
import type { UseProfileContentReturn } from "@/hooks/useProfileContent";
import { API_BASE_URL } from "@/lib/config";
import type { User as AuthUser } from "@/services/auth.service";

export function ProfileContentView({
  activeTab,
  user,
  c,
}: {
  activeTab: ProfileTab | null;
  user: AuthUser | null;
  c: UseProfileContentReturn;
}) {
  const {
    fileInputRef,
    name,
    setName,
    email,
    setEmail,
    hostStory,
    setHostStory,
    phone,
    setPhone,
    savingProfile,
    uploadingPhoto,
    deletingAccount,
    passwordCurrent,
    setPasswordCurrent,
    passwordNew,
    setPasswordNew,
    passwordConfirm,
    setPasswordConfirm,
    savingPassword,
    authProvider,
    canChangePassword,
    googleLinked,
    bookingsLoading,
    previewList,
    previewTotal,
    handleSaveProfile,
    handlePhotoSelected,
    handleUpdatePassword,
    handleDeactivateAccount,
    showPass,
    setShowPass,
    showNewPass,
    setShowNewPass,
    deleteConfirm,
    setDeleteConfirm,
  } = c;

  return (
    <div className="space-y-6">
      {activeTab === "personal" && (
        <>
          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">
                  Personal Information
                </h2>
                <p className="text-on-surface-variant text-xs">
                  Update your photo and personal details.
                </p>
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
                  {uploadingPhoto ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                    Email Address
                  </label>
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
                      <span className="ml-1.5 text-[10px] font-normal text-primary dark:text-green-400">
                        (shown to guests who book your experience)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Smartphone
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
                      aria-hidden
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(ev) => setPhone(ev.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      className="w-full pl-9 text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Use international format, e.g. +251912345678
                  </p>
                </div>
                {user?.hostStatus === "approved" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                      About you{" "}
                      <span className="font-normal text-on-surface-variant/80">
                        (guests see this on your listings)
                      </span>
                    </label>
                    <p className="text-[11px] text-on-surface-variant mb-2 leading-relaxed">
                      Share why you host and what guests can expect—a short introduction
                      shown on your experience pages.
                    </p>
                    <textarea
                      value={hostStory}
                      onChange={(ev) => setHostStory(ev.target.value.slice(0, 500))}
                      rows={4}
                      maxLength={500}
                      placeholder="e.g. I grew up in Addis and want every guest to taste real home-style injera and hear the stories behind each dish…"
                      className="w-full text-sm bg-surface-container-low border-none rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {hostStory.length}/500
                    </p>
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
            <h2 className="font-headline font-extrabold text-lg text-primary mb-4">
              Linked Accounts
            </h2>
            <p className="text-xs text-on-surface-variant mb-2">
              {authProvider === "google" && "You sign in with Google."}
              {authProvider === "facebook" &&
                "Your account was linked with Facebook. Sign-in with Facebook is no longer available. Use forgot password on the login page to set an email password, or contact support."}
              {authProvider === "local" && "You sign in with email and password."}
            </p>
            <p className="text-[11px] text-on-surface-variant mb-4 leading-relaxed">
              To <strong>link</strong> Google, use the button below and sign in with a
              provider that uses the <strong>same email</strong> as this account.
              You&apos;ll return here with an updated session.
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
                  href={`${API_BASE_URL}/auth/google`}
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
                <h2 className="font-headline font-extrabold text-lg text-red-600 mb-0.5">
                  Deactivate account
                </h2>
                <p className="text-on-surface-variant text-xs">
                  Your profile will be hidden and you won&apos;t be able to sign in again.
                  We may keep certain records where required by law.
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
              You&apos;ll be signed out immediately after deactivation.
            </p>
          </section>
        </>
      )}

      {activeTab === "security" && (
        <>
          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Key className="h-4 w-4 text-on-tertiary-container" />
              <h2 className="font-headline font-extrabold text-lg text-primary">
                Change Password
              </h2>
            </div>
            {!canChangePassword ? (
              <p className="text-sm text-on-surface-variant max-w-md">
                Password change is only available for accounts that use email and password.
                OAuth accounts use your provider to sign in.
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
            <div
              className="absolute inset-0 bg-background/40 dark:bg-black/20 pointer-events-none z-[1]"
              aria-hidden
            />
            <div className="relative z-[2] space-y-3">
              <ProfileComingSoonBanner />
              <div className="flex items-center justify-between gap-3 opacity-55 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-on-tertiary-container" />
                  <h2 className="font-headline font-extrabold text-lg text-primary">
                    Two-Factor Authentication
                  </h2>
                </div>
                <ProfileToggleDisabled checked={false} />
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed max-w-md opacity-55 pointer-events-none select-none">
                Add an extra step at sign-in with a code from an authenticator app or SMS.
                We&apos;ll enable this in a future release.
              </p>
            </div>
          </section>

          <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div
              className="absolute inset-0 bg-background/40 dark:bg-black/20 pointer-events-none z-[1]"
              aria-hidden
            />
            <div className="relative z-[2] space-y-3">
              <ProfileComingSoonBanner />
              <div className="flex items-center gap-2 opacity-55 pointer-events-none select-none">
                <Laptop className="h-4 w-4 text-on-tertiary-container" />
                <h2 className="font-headline font-extrabold text-lg text-primary">
                  Active Sessions
                </h2>
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
                      <p className="font-headline font-bold text-sm text-primary">
                        This device — preview
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        Session list coming soon
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                    Disabled
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "notifications" && (
        <section className="bg-white dark:bg-[#2d3133] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div
            className="absolute inset-0 bg-background/35 dark:bg-black/15 pointer-events-none z-[1]"
            aria-hidden
          />
          <div className="relative z-[2]">
            <h2 className="font-headline font-extrabold text-lg text-primary mb-3">
              Notification Preferences
            </h2>
            <ProfileComingSoonBanner className="mb-5" />
            <p className="text-xs text-on-surface-variant mb-4 opacity-70">
              Choose how we reach you about bookings, messages, and updates. Controls below
              are a preview only.
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
                <div
                  key={group.title}
                  className="bg-surface-container-low rounded-xl p-4 space-y-3 ring-1 ring-outline-variant/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {group.icon}
                    <span className="font-headline font-bold text-sm text-primary">
                      {group.title}
                    </span>
                  </div>
                  {group.items.map((label) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-on-surface-variant">{label}</span>
                      <ProfileToggleDisabled checked={false} />
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
              <h2 className="font-headline font-extrabold text-xl text-primary mb-0.5">
                My Bookings
              </h2>
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
                        {formatBookingDate(b.experienceDate ?? b.createdAt)} · {b.quantity}{" "}
                        guest
                        {b.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs font-bold text-primary dark:text-green-400">
                        ETB{" "}
                        {typeof b.price === "number" ? b.price.toLocaleString() : b.price}
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
