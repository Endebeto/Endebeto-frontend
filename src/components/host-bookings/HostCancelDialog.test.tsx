import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HostCancelDialog } from "./HostCancelDialog";
import type { Booking } from "@/services/bookings.service";

const { getCancelPreview } = vi.hoisted(() => ({ getCancelPreview: vi.fn() }));
vi.mock("@/services/bookings.service", () => ({
  bookingsService: { getCancelPreview, hostCancelBooking: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const booking = {
  _id: "b1",
  price: 1000,
  status: "upcoming",
  paid: true,
  quantity: 1,
  user: { _id: "u1", name: "Sara", email: "s@test.local" },
  experience: { _id: "e1", title: "Coffee Ceremony", price: 1000 },
} as unknown as Booking;

describe("HostCancelDialog (refund design step 4)", () => {
  it("shows the guest refund and the host's charge before confirming", async () => {
    getCancelPreview.mockResolvedValue({
      data: {
        data: {
          preview: {
            by: "host",
            kind: "host",
            paidCents: 100000,
            refundCents: 100000,
            chapaFeeCents: 2500,
            chapaFeeEstimated: false,
            platformFeeCents: 15000,
            hostChargeCents: 17500,
            cancellationPolicy: "24h",
            freeCancelUntil: null,
          },
        },
      },
    });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <HostCancelDialog booking={booking} onClose={() => {}} />
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/You.ll be charged ETB 175\.00/)).toBeInTheDocument();
    expect(screen.getByText(/full refund of ETB 1,000\.00/)).toBeInTheDocument();
    expect(getCancelPreview).toHaveBeenCalledWith("b1");
  });
});
