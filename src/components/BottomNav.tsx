import { Home, PenTool, Library, Users, GraduationCap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: PenTool, label: "Create", path: "/create" },
  { icon: Library, label: "Market", path: "/bookstore" },
  { icon: Users, label: "Clubs", path: "/clubs" },
  { icon: GraduationCap, label: "Library", path: "/library" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path === "/feed" && location.pathname === "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-[44px] min-h-[44px] justify-center ${
                active ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide uppercase font-body">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
