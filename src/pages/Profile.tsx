import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProfileContentView } from "@/components/profile/ProfileContentView";
import { ProfileDesktopSidebar } from "@/components/profile/ProfileDesktopSidebar";
import { ProfileMobileMenu } from "@/components/profile/ProfileMobileMenu";
import type { ProfileTab } from "@/components/profile/profileUtils";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileContent } from "@/hooks/useProfileContent";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [mobileView, setMobileView] = useState<"menu" | ProfileTab>("menu");
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const displayName = user?.name ?? "";
  const isAdmin = user?.role === "admin";
  const isHost = user?.hostStatus === "approved" || isAdmin;

  const contentTab = useMemo<ProfileTab | null>(() => {
    if (!isMobile) return activeTab;
    return mobileView === "menu" ? null : mobileView;
  }, [isMobile, activeTab, mobileView]);

  const content = useProfileContent(
    user,
    updateUser,
    contentTab,
    showPass,
    setShowPass,
    showNewPass,
    setShowNewPass,
    deleteConfirm,
    setDeleteConfirm,
  );

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14 pb-16 max-w-6xl mx-auto">
        <div className="md:hidden">
          {mobileView === "menu" && (
            <ProfileMobileMenu
              displayName={displayName}
              userEmail={user?.email}
              userPhoto={user?.photo}
              isAdmin={isAdmin}
              isHost={isHost}
              onSelectTab={(t) => setMobileView(t)}
              onSignOut={handleSignOut}
            />
          )}

          {mobileView !== "menu" && (
            <div className="px-4 pt-4 pb-10 space-y-4">
              <button
                type="button"
                onClick={() => setMobileView("menu")}
                className="flex items-center gap-2 text-primary font-headline font-bold text-sm mb-1 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </button>
              <ProfileContentView user={user} activeTab={mobileView} c={content} />
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-row gap-6 px-4 pt-6">
          <ProfileDesktopSidebar
            displayName={displayName}
            userPhoto={user?.photo}
            isAdmin={isAdmin}
            isHost={isHost}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onSignOut={handleSignOut}
          />

          <div className="flex-1 space-y-6 min-w-0">
            <ProfileContentView user={user} activeTab={activeTab} c={content} />
          </div>
        </div>
      </main>
    </div>
  );
}
