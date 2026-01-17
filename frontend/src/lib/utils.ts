import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with proper conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 *
 * @example
 * cn("p-4", "p-2") // Returns "p-2"
 * cn("base-class", isActive && "active-class") // Conditional
 * cn("text-destructive", className) // Merges with passed className
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
