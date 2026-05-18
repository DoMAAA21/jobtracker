import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function pickSearchParams(
  input: Record<string, string | number | null | undefined>,
): Record<string, string> {
  return Object.entries(input)
    .filter(([, value]) => value !== '' && value != null)
    .reduce<Record<string, string>>(
      (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
      {},
    );
}

export function trimFormValues<T extends Record<string, string>>(form: T): T {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value.trim()]),
  ) as T;
}

export function pickParamsFromKeys(
  keys: readonly string[],
  getValue: (key: string) => string | null | undefined,
): Record<string, string> {
  return pickSearchParams(
    Object.fromEntries(keys.map((key) => [key, getValue(key)])),
  );
}