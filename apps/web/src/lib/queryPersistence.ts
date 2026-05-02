const QUERY_CACHE_PREFIX = "jobpilot.query.";

type PersistedValue<T> = {
  data: T;
  updatedAt: number;
};

export function readPersistedQuery<T>(
  key: string,
  maxAgeMs = 24 * 60 * 60 * 1000,
) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const raw = window.localStorage.getItem(`${QUERY_CACHE_PREFIX}${key}`);
  if (!raw) {
    return undefined;
  }

  try {
    const persisted = JSON.parse(raw) as PersistedValue<T>;
    if (Date.now() - persisted.updatedAt > maxAgeMs) {
      window.localStorage.removeItem(`${QUERY_CACHE_PREFIX}${key}`);
      return undefined;
    }

    return persisted.data;
  } catch {
    window.localStorage.removeItem(`${QUERY_CACHE_PREFIX}${key}`);
    return undefined;
  }
}

export function persistQueryData<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PersistedValue<T> = {
    data,
    updatedAt: Date.now(),
  };
  window.localStorage.setItem(
    `${QUERY_CACHE_PREFIX}${key}`,
    JSON.stringify(payload),
  );
}
