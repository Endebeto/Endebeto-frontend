import { useCallback, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";

export type AdminHeaderState = {
  searchPlaceholder: string;
  searchValue: string;
  onSearch: (v: string) => void;
  onSearchImmediate?: (v: string) => void;
};

export type AdminOutletContextType = {
  setHeader: (
    state:
      | AdminHeaderState
      | null
      | ((prev: AdminHeaderState | null) => AdminHeaderState | null),
  ) => void;
};

/**
 * Registers AdminLayout header search config with the parent admin shell.
 * Uses a ref to ensure onSearch callback changes never trigger re-renders
 * or infinite loops, and performs shallow equality before updating header state.
 */
export function useSyncAdminHeader({
  searchPlaceholder,
  searchValue,
  onSearch,
  onSearchImmediate,
}: AdminHeaderState): void {
  const { setHeader } = useOutletContext<AdminOutletContextType>();

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const onSearchImmediateRef = useRef(onSearchImmediate);
  useEffect(() => {
    onSearchImmediateRef.current = onSearchImmediate;
  }, [onSearchImmediate]);

  const stableOnSearch = useCallback((v: string) => {
    onSearchRef.current?.(v);
  }, []);

  const stableOnSearchImmediate = useCallback((v: string) => {
    onSearchImmediateRef.current?.(v);
  }, []);

  useEffect(() => {
    setHeader((prev) => {
      if (
        prev &&
        prev.searchPlaceholder === searchPlaceholder &&
        prev.searchValue === searchValue &&
        prev.onSearch === stableOnSearch &&
        prev.onSearchImmediate === stableOnSearchImmediate
      ) {
        return prev;
      }
      return {
        searchPlaceholder,
        searchValue,
        onSearch: stableOnSearch,
        onSearchImmediate: stableOnSearchImmediate,
      };
    });
  }, [
    setHeader,
    searchPlaceholder,
    searchValue,
    stableOnSearch,
    stableOnSearchImmediate,
  ]);

  useEffect(() => {
    return () => setHeader(null);
  }, [setHeader]);
}
