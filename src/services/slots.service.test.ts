import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/lib/api";
import { slotsService } from "./slots.service";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("slotsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /experiences/:id/slots with query params", async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        status: "success",
        results: 1,
        data: {
          slots: [
            {
              _id: "slot123",
              startTime: "2026-10-15T10:00:00Z",
              maxGuests: 5,
              availableSpots: 5,
            },
          ],
        },
      },
    });

    const res = await slotsService.getExperienceSlots("exp123", {
      from: "2026-10-10",
      includeCancelled: true,
    });

    expect(api.get).toHaveBeenCalledWith("/experiences/exp123/slots", {
      params: { from: "2026-10-10", includeCancelled: true },
    });
    expect(res.data.status).toBe("success");
    expect(res.data.data.slots).toHaveLength(1);
  });

  it("calls POST /experiences/:id/slots for single slot", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          slot: {
            _id: "slot456",
            startTime: "2026-10-16T14:00:00Z",
          },
        },
      },
    });

    const payload = {
      startTime: "2026-10-16T14:00:00Z",
      maxGuests: 6,
      price: 300,
    };
    const res = await slotsService.createSingleSlot("exp123", payload);

    expect(api.post).toHaveBeenCalledWith(
      "/experiences/exp123/slots",
      payload,
    );
    expect(res.data.data.slot._id).toBe("slot456");
  });

  it("calls POST /experiences/:id/slots for recurring slots rule", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        status: "success",
        results: 4,
        data: {
          slots: [],
          recurringRuleId: "rec-test-123",
        },
      },
    });

    const payload = {
      recurring: {
        daysOfWeek: [0, 6],
        timeOfDay: "10:00",
        startDate: "2026-10-10",
        endDate: "2026-10-25",
      },
      maxGuests: 4,
    };
    const res = await slotsService.createRecurringSlots("exp123", payload);

    expect(api.post).toHaveBeenCalledWith(
      "/experiences/exp123/slots",
      payload,
    );
    expect(res.data.results).toBe(4);
    expect(res.data.data.recurringRuleId).toBe("rec-test-123");
  });

  it("calls PATCH /experiences/:id/slots/:slotId", async () => {
    (api.patch as any).mockResolvedValueOnce({
      data: {
        status: "success",
        data: { slot: { _id: "slot123", maxGuests: 10 } },
      },
    });

    const res = await slotsService.updateSlot("exp123", "slot123", {
      maxGuests: 10,
    });

    expect(api.patch).toHaveBeenCalledWith(
      "/experiences/exp123/slots/slot123",
      { maxGuests: 10 },
    );
    expect(res.data.data.slot.maxGuests).toBe(10);
  });

  it("calls DELETE /experiences/:id/slots/:slotId", async () => {
    (api.delete as any).mockResolvedValueOnce({
      data: { status: "success" },
    });

    const res = await slotsService.deleteSlot("exp123", "slot123");

    expect(api.delete).toHaveBeenCalledWith(
      "/experiences/exp123/slots/slot123",
    );
    expect(res.data.status).toBe("success");
  });
});
