'use client';

import { AuthLayout } from '../components/AuthLayout';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

/**
 * ForgotPasswordPage component
 * Renders the password reset request form within the auth layout
 *
 * @example
 * // In Next.js route
 * export default function ForgotPasswordRoute() {
 *   return <ForgotPasswordPage />;
 * }
 */
export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
