import { AuthGuard } from '@/components/providers/AuthGuard';
import { DashboardNav } from '@/components/navigation/DashboardNav';

/**
 * Dashboard layout with sidebar navigation.
 * Wraps all dashboard pages with authentication and navigation.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
          <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center border-b border-border px-6">
              <h1 className="text-xl font-bold text-foreground">Auth App</h1>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <DashboardNav />
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <p className="text-xs text-muted-foreground">© 2024 Auth App</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
