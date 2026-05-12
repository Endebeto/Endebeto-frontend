import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  profileApiErrMessage,
  type ProfileTab,
} from "@/components/profile/profileUtils";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import type { User as AuthUser } from "@/services/auth.service";
import { bookingsService } from "@/services/bookings.service";

export function useProfileContent(
  user: AuthUser | null,
  updateUser: (u: AuthUser) => void,
  activeTab: ProfileTab | null,
  showPass: boolean,
  setShowPass: Dispatch<SetStateAction<boolean>>,
  showNewPass: boolean,
  setShowNewPass: Dispatch<SetStateAction<boolean>>,
  deleteConfirm: boolean,
  setDeleteConfirm: (v: boolean) => void,
) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
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
    setHostStory(user.hostStory ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const authProvider = user?.authProvider ?? "local";
  const canChangePassword = authProvider === "local";
  const googleLinked = !!user?.googleId || authProvider === "google";

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
        phone: phone.trim(),
        ...(user.hostStatus === "approved" ? { hostStory: hostStory.trim() } : {}),
      });
      updateUser(res.data.data.user);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(profileApiErrMessage(e));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
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
      toast.error(profileApiErrMessage(err));
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
      toast.error(profileApiErrMessage(e));
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
      toast.error(profileApiErrMessage(e));
    } finally {
      setDeletingAccount(false);
      setDeleteConfirm(false);
    }
  };

  return {
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
  };
}

export type UseProfileContentReturn = ReturnType<typeof useProfileContent>;
