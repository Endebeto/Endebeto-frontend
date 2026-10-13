import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import { walletService, type PayoutAccount } from "@/services/wallet.service";

/** True when `holdUntil` is a valid ISO date in the future. */
export function isHoldActive(holdUntil: string | null | undefined): boolean {
  if (!holdUntil) return false;
  const t = new Date(holdUntil).getTime();
  return Number.isFinite(t) && t > Date.now();
}

export function usePayoutAccount() {
  const { user } = useAuth();
  const userId = user?._id;
  return useQuery<PayoutAccount>({
    queryKey: hostQueryKeys.wallet.payoutAccount(userId),
    queryFn: async () =>
      (await walletService.getPayoutAccount()).data.data.payoutAccount,
    enabled: !!userId,
    staleTime: 30_000,
  });
}
