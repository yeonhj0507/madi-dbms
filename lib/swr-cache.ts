export function swrGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`swr:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function swrSet(key: string, value: unknown) {
  try {
    sessionStorage.setItem(`swr:${key}`, JSON.stringify(value));
  } catch {}
}
