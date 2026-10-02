import { useCallback, useState } from "react";
import { toApiError } from "../../../../shared/api/ApiError";
import { acceptOrder, rejectOrder } from "../services/distributorOrderService";

interface OrderDecisionState {
  submitting: boolean;
  error: string;
}

const IDLE: OrderDecisionState = { submitting: false, error: "" };

// Accepting or rejecting one order. Both resolve to whether the decision went
// through; on failure the reason is in `error`.
const useOrderDecision = (orderId: string | undefined) => {
  const [state, setState] = useState<OrderDecisionState>(IDLE);

  const submit = useCallback(
    async (decide: (id: string) => Promise<unknown>): Promise<boolean> => {
      if (!orderId) return false;

      setState({ submitting: true, error: "" });

      try {
        await decide(orderId);
        setState(IDLE);
        return true;
      } catch (error) {
        setState({ submitting: false, error: toApiError(error).message });
        return false;
      }
    },
    [orderId],
  );

  const accept = useCallback(() => submit(acceptOrder), [submit]);

  const reject = useCallback(
    (reason: string) => submit((id) => rejectOrder(id, reason)),
    [submit],
  );

  return { ...state, accept, reject };
};

export default useOrderDecision;
