import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useSeedData } from "./hooks/useSeedData";
import CustomerPortal from "./pages/CustomerPortal";
import ManagerPortal from "./pages/ManagerPortal";
import OwnerPortal from "./pages/OwnerPortal";
import RoleSelector from "./pages/RoleSelector";
import StaffPortal from "./pages/StaffPortal";

type Route = "/" | "/manager" | "/staff" | "/owner" | "/select";

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const path = window.location.pathname;
    if (path === "/manager") return "/manager";
    if (path === "/staff") return "/staff";
    if (path === "/owner") return "/owner";
    if (path === "/") return "/";
    return "/";
  });

  // Seed sample data on first load
  useSeedData();

  // Update browser URL on route change
  useEffect(() => {
    window.history.pushState({}, "", currentRoute);
  }, [currentRoute]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as Route;
      setCurrentRoute(path);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentRoute(path as Route);
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
      {/* Portal switch nav - small floating buttons */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <div className="bg-card border border-border rounded-xl shadow-royal p-2 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground text-center font-semibold mb-1 px-2">
            Switch Portal
          </p>
          {[
            { path: "/", label: "Customer", emoji: "🎉" },
            { path: "/manager", label: "Manager", emoji: "👔" },
            { path: "/staff", label: "Staff", emoji: "🍳" },
            { path: "/owner", label: "Owner", emoji: "👑" },
          ].map(({ path, label, emoji }) => (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentRoute === path
                  ? "bg-maroon text-white font-semibold"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {renderRoute()}
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
