import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toComparableOptionValue(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
}
