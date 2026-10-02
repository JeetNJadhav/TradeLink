import { useCallback, useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  locating: boolean;
  error: string;
}

const IDLE: GeolocationState = { locating: false, error: "" };

const UNAVAILABLE_MESSAGE =
  "Could not get your location. Enter the coordinates by hand.";

const LOCATE_TIMEOUT_MS = 10_000;

// Asks the browser for the device's position. `locate` resolves to null when
// the position is not available (denied, unsupported, timed out); the reason
// is in `error`.
const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(IDLE);

  const locate = useCallback(
    (): Promise<Coordinates | null> =>
      new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          setState({ locating: false, error: UNAVAILABLE_MESSAGE });
          resolve(null);
          return;
        }

        setState({ locating: true, error: "" });

        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            setState(IDLE);
            resolve({ latitude: coords.latitude, longitude: coords.longitude });
          },
          () => {
            setState({ locating: false, error: UNAVAILABLE_MESSAGE });
            resolve(null);
          },
          { timeout: LOCATE_TIMEOUT_MS },
        );
      }),
    [],
  );

  return { ...state, locate };
};

export default useGeolocation;
