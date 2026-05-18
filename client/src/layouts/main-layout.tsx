import { Briefcase, LogOut, Menu, X } from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { footerMenuItems, mainMenuItems } from './menu.config';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Briefcase className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">JobTracker</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {mainMenuItems.map((item) => (
          <SidebarNavLink
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-sidebar-border p-3">
        {footerMenuItems.map((item) => (
          <SidebarNavLink
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            onNavigate={onNavigate}
          />
        ))}

        <div className="mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
            {user?.name ?? 'Account'}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              onNavigate?.();
              void logout();
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-svh w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <h1 className="text-sm font-medium text-muted-foreground md:text-base md:text-foreground">
            Job application tracker
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
