import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** Enable two-column desktop layout with sidebar slot */
  sidebar?: ReactNode;
}

export default function AppShell({ children, className = "", sidebar }: AppShellProps) {
  if (sidebar) {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <div className="max-w-6xl mx-auto lg:flex lg:gap-8 lg:px-6">
          <div className="flex-1 min-w-0">{children}</div>
          <aside className="hidden lg:block w-80 shrink-0 py-4 sticky top-0 self-start max-h-screen overflow-y-auto">
            {sidebar}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="max-w-2xl mx-auto">{children}</div>
    </div>
  );
}
