import { notFound } from 'next/navigation';

/**
 * Catch-all route handler for unmatched paths within a locale.
 *
 * This ensures that routes like /en/random-path trigger the custom
 * not-found.tsx design instead of the default Next.js 404 page.
 */
export default function CatchAllPage() {
  notFound();
}
