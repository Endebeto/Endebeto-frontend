import { useEffect, useRef } from "react";
import { useFocusTrap } from "./useFocusTrap";

/**
 * P2-21: keyboard + screen-reader basics for the custom (non-Radix) modals.
 * Traps Tab inside the dialog, returns focus to the trigger on close, and
 * closes on Escape unless a request is in flight.
 *
 * Put the returned ref on the dialog panel, together with
 * role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}.
 */
export function useModalA11y<T extends HTMLElement>({
  onClose,
  closeDisabled = false,
  active = true,
}: {
  onClose: () => void;
  closeDisabled?: boolean;
  /** Pass `mounted` for portals that render after a mount flag flips. */
  active?: boolean;
}) {
  const ref = useRef<T>(null);
  useFocusTrap(ref, active);

  // Keep the latest values without re-binding the listener every render.
  const latest = useRef({ onClose, closeDisabled });
  latest.current = { onClose, closeDisabled };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.closeDisabled) {
        e.stopPropagation();
        latest.current.onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return ref;
}
