'use client';

import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

/**
 * LoginPage component
 * Renders the login form within the auth layout
 *
 * @example
 * // In Next.js route
 * export default function LoginRoute() {
 *   return <LoginPage />;
 * }
 */
export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
