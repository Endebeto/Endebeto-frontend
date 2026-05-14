import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export type AdminHeaderState = {
  searchPlaceholder: string;
  searchValue: string;
  onSearch: (v: string) => void;
};

export type AdminOutletContextType = {
  setHeader: (state: AdminHeaderState | null) => void;
};

/**
 * Registers AdminLayout header search config with the parent admin shell.
 * Clears on unmount or when deps change cleanup runs before re-register.
 */
export function useSyncAdminHeader({
  searchPlaceholder,
  searchValue,
  onSearch,
}: AdminHeaderState): void {
  const { setHeader } = useOutletContext<AdminOutletContextType>();
  useEffect(() => {
    setHeader({ searchPlaceholder, searchValue, onSearch });
    return () => setHeader(null);
  }, [setHeader, searchPlaceholder, searchValue, onSearch]);
}
