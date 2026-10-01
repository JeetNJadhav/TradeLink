// Lets the API layer announce that the session ended without knowing who reacts to it.

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

export const onSessionExpired = (listener: SessionExpiredListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const emitSessionExpired = () => {
  listeners.forEach((listener) => listener());
};
