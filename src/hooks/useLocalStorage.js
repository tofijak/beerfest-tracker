import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "../lib/storage";

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => ({
    key,
    value: readJson(key, initialValue),
  }));

  if (state.key !== key) {
    setState({ key, value: readJson(key, initialValue) });
  }

  useEffect(() => {
    writeJson(state.key, state.value);
  }, [state.key, state.value]);

  const setValue = useCallback((updater) => {
    setState((current) => {
      const next = typeof updater === "function" ? updater(current.value) : updater;
      return { key: current.key, value: next };
    });
  }, []);

  return [state.value, setValue];
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
