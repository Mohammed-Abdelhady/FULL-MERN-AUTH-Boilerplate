'use client';

import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

/**
 * RegisterPage component
 * Renders the registration form within the auth layout
 *
 * @example
 * // In Next.js route
 * export default function RegisterRoute() {
 *   return <RegisterPage />;
 * }
 */
export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
