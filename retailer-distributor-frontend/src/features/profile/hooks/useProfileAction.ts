import { useCallback, useState } from "react";
import { toApiError } from "../../../shared/api/ApiError";

interface ProfileActionState {
  submitting: boolean;
  error: string;
}

const IDLE: ProfileActionState = { submitting: false, error: "" };

// One write on the profile screen (saving details, changing the password).
// `run` resolves to whether it went through; on failure the reason is in `error`.
const useProfileAction = () => {
  const [state, setState] = useState<ProfileActionState>(IDLE);

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

export default useProfileAction;
