import { useEffect, useState } from "react";

export const useProductSearchDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<any>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
