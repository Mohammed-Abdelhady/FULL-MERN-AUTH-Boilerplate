'use client';

import { AuthLayout } from '../components/AuthLayout';
import { ActivationForm } from '../components/ActivationForm';

/**
 * ActivationPage component
 * Renders the email verification form within the auth layout
 *
 * @example
 * // In Next.js route
 * export default function ActivationRoute() {
 *   return <ActivationPage />;
 * }
 */
export function ActivationPage() {
  return (
    <AuthLayout>
      <ActivationForm />
    </AuthLayout>
  );
}
