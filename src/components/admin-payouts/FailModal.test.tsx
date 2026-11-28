import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FailModal } from "./FailModal";
import type { AdminWithdrawal } from "@/services/admin.service";

const wr = { _id: "w1", host: { name: "Abebe" } } as unknown as AdminWithdrawal;

describe("FailModal accessibility (P2-21)", () => {
  it("is a labelled modal dialog with focus inside it", () => {
    render(<FailModal wr={wr} onClose={() => {}} onConfirm={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /mark payout as failed/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<FailModal wr={wr} onClose={onClose} onConfirm={() => {}} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape while the request is in flight", () => {
    const onClose = vi.fn();
    render(<FailModal wr={wr} onClose={onClose} onConfirm={() => {}} loading />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("returns focus to the trigger when it closes", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(
      <FailModal wr={wr} onClose={() => {}} onConfirm={() => {}} />,
    );
    expect(document.activeElement).not.toBe(trigger);
    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
