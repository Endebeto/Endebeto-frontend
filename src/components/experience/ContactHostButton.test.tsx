import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContactHostButton } from "./ContactHostButton";

const { authState, getHostContact, contactHost } = vi.hoisted(() => ({
  authState: { isAuthenticated: true },
  getHostContact: vi.fn(),
  contactHost: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("@/services/experiences.service", () => ({
  experiencesService: { getHostContact, contactHost },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

const props = {
  experienceId: "exp1",
  host: { name: "Abebe Kebede" },
  experienceTitle: "Coffee Ceremony",
};

describe("ContactHostButton (P1-6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
  });

  it("asks signed-out visitors to log in", () => {
    authState.isAuthenticated = false;
    wrap(<ContactHostButton {...props} booked={false} />);
    expect(screen.getByRole("link", { name: /log in to contact/i })).toBeInTheDocument();
  });

  it("lets a guest without a booking message the host through Endebeto", async () => {
    contactHost.mockResolvedValue({ data: { status: "success" } });
    wrap(<ContactHostButton {...props} booked={false} />);
    fireEvent.click(screen.getByRole("button", { name: /message host/i }));
    expect(screen.getByRole("dialog", { name: /message abebe/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/your message/i), {
      target: { value: "Is this suitable for children?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() =>
      expect(contactHost).toHaveBeenCalledWith("exp1", "Is this suitable for children?"),
    );
    expect(getHostContact).not.toHaveBeenCalled();
  });

  it("loads real contact details only for booked guests", async () => {
    getHostContact.mockResolvedValue({
      data: { data: { host: { email: "host@test.local", phone: "0911000111" } } },
    });
    wrap(<ContactHostButton {...props} booked />);
    fireEvent.click(screen.getByRole("button", { name: /contact host/i }));
    expect(await screen.findByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/0911000111"),
    );
    expect(getHostContact).toHaveBeenCalledWith("exp1");
  });
});
