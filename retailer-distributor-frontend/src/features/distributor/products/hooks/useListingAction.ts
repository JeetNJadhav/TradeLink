import { useCallback, useState } from "react";
import { toApiError } from "../../../../shared/api/ApiError";

interface ListingActionState {
  submitting: boolean;
  error: string;
}

const IDLE: ListingActionState = { submitting: false, error: "" };

// One write on a listing (adding, saving or removing it).
// `run` resolves to whether it went through; on failure the reason is in `error`.
const useListingAction = () => {
  const [state, setState] = useState<ListingActionState>(IDLE);

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      setState({ submitting: true, error: "" });

      try {
        await action();
        setState(IDLE);
        return true;
      } catch (error) {
        setState({ submitting: false, error: toApiError(error).message });
        return false;
      }
    },
    [],
  );

  return { ...state, run };
};

export default useListingAction;
