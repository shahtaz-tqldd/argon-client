import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function toComparableOptionValue(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export const getInitials = (name) =>
  String(name || "Workspace")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "W";

export const formatStatus = (status) =>
  String(status || "draft")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const toArray = (value) => (Array.isArray(value) ? value : []);

export const toSnakeCase = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
