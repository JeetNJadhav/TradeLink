import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { onSessionExpired } from "../../../shared/api/authEvents";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/authService";
import type { AuthUser } from "../types";
import { AuthContext } from "./AuthContext";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  // Restore the session on page load.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const restoreSession = async () => {
      try {
        const user = await getCurrentUser(signal);
        if (signal.aborted) return;

        setState({ user, isLoading: false });
      } catch {
        if (signal.aborted) return;

        setState({ user: null, isLoading: false });
      }
    };

    void restoreSession();

    return () => controller.abort();
  }, []);

  // The API layer reports when a refresh was rejected and the session is over.
  useEffect(
    () => onSessionExpired(() => setState({ user: null, isLoading: false })),
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const user = await loginRequest(email, password);
    setState({ user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // The user is signed out locally either way.
      console.error("Logout request failed", error);
    } finally {
      setState({ user: null, isLoading: false });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
