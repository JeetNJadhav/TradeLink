import { useCallback, useEffect, useState } from "react";
import { type ApiError, toApiError } from "../api/ApiError";

export type AsyncTask<T> = (signal: AbortSignal) => Promise<T>;

interface Settled<T> {
  task: AsyncTask<T>;
  data: T | null;
  error: ApiError | null;
}

const hasDataFor = <T>(settled: Settled<T> | null, task: AsyncTask<T>) =>
  settled?.task === task && settled.data !== null;

// Runs `task` whenever its identity changes and aborts the previous run, so a
// slow older response can never overwrite a newer one. Pass a memoized task
// (useCallback), or null to stay idle.
// `reload` re-runs the current task while keeping the data already shown.
export const useAsync = <T>(task: AsyncTask<T> | null) => {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!task) return;

    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      try {
        const data = await task(signal);
        if (signal.aborted) return;

        setSettled({ task, data, error: null });
      } catch (error) {
        if (signal.aborted) return;

        const failed: Settled<T> = {
          task,
          data: null,
          error: toApiError(error),
        };
        // A failed reload keeps what is already on screen.
        setSettled((previous) =>
          hasDataFor(previous, task) ? previous : failed,
        );
      }
    };

    void run();

    return () => controller.abort();
  }, [task, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // A result only counts if it belongs to the task currently requested.
  const current = task !== null && settled?.task === task ? settled : null;

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: task !== null && current === null,
    reload,
  };
};
