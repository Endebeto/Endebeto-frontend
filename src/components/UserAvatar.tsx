import { useEffect, useState } from "react";
import { getUserInitials, isDisplayableProfilePhotoUrl } from "@/lib/profilePhoto";

type UserAvatarProps = {
  name: string | undefined | null;
  photo?: string | null;
  /** Outer box: size, shape, background for initials state */
  className?: string;
  /** Typography for initials (e.g. text-white text-xl) */
  initialsClassName?: string;
  /** Passed to <img> */
  imgClassName?: string;
  alt?: string;
};

/**
 * Shows a profile image only for real URLs (https, data, blob).
 * Email/password users often have missing, relative, or placeholder paths — those show initials like OAuth-only flows.
 */
export function UserAvatar({
  name,
  photo,
  className = "",
  initialsClassName = "",
  imgClassName = "w-full h-full object-cover",
  alt,
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const urlOk = isDisplayableProfilePhotoUrl(photo) && !imgFailed;

  useEffect(() => {
    setImgFailed(false);
  }, [photo]);

  return (
    <div className={`flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      {urlOk ? (
        <img
          src={photo!.trim()}
          alt={alt ?? name ?? ""}
          className={imgClassName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className={`font-headline font-bold select-none ${initialsClassName}`}>
          {getUserInitials(name)}
        </span>
      )}
    </div>
  );
}
