import { Toaster } from "@/components/ui/sonner";
import { Briefcase, ChefHat, Crown, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useSeedData } from "./hooks/useSeedData";
import CustomerPortal from "./pages/CustomerPortal";
import ManagerPortal from "./pages/ManagerPortal";
import OwnerPortal from "./pages/OwnerPortal";
import StaffPortal from "./pages/StaffPortal";

type Route = "/" | "/manager" | "/staff" | "/owner";

const NAV_ITEMS = [
  { path: "/" as Route, label: "Customer", icon: Home },
  { path: "/manager" as Route, label: "Manager", icon: Briefcase },
  { path: "/staff" as Route, label: "Kitchen", icon: ChefHat },
  { path: "/owner" as Route, label: "Owner", icon: Crown },
];

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const path = window.location.pathname;
    if (path === "/manager") return "/manager";
    if (path === "/staff") return "/staff";
    if (path === "/owner") return "/owner";
    return "/";
  });

  useSeedData();

  useEffect(() => {
    window.history.pushState({}, "", currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      setCurrentRoute(path);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: Route) => {
    setCurrentRoute(path);
  };

  const renderRoute = () => {
    switch (currentRoute) {
      case "/":
        return <CustomerPortal />;
      case "/manager":
        return <ManagerPortal />;
      case "/staff":
        return <StaffPortal />;
      case "/owner":
        return <OwnerPortal />;
      default:
        return <CustomerPortal />;
    }
  };

  return (
    <>
      {/* Main content — padded at bottom to clear the nav bar */}
      <div className="pb-16">{renderRoute()}</div>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[200] portal-header shadow-[0_-2px_12px_rgba(0,0,0,0.2)] mobile-bottom-nav">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = currentRoute === path;
            return (
              <button
                type="button"
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-all duration-200 relative ${
                  isActive ? "text-gold" : "text-white/60 active:text-white/90"
                }`}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium leading-none tracking-wide ${isActive ? "text-gold" : "text-white/60"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
