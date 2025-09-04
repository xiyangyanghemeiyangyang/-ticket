export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, waitMs = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, waitMs);
  };
}


