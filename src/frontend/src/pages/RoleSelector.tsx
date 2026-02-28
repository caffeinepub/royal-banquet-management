import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

interface Props {
  onNavigate: (path: string) => void;
}

export default function RoleSelector({ onNavigate }: Props) {
  const roles = [
    {
      id: "customer",
      title: "Customer",
      subtitle: "Book an Event",
      description: "View halls, menus, events and book your celebration",
      icon: "🎉",
      path: "/",
      color: "border-gold hover:bg-gold/5",
      btnClass: "bg-gold text-maroon hover:bg-gold/90 font-bold",
    },
    {
      id: "manager",
      title: "Branch Manager",
      subtitle: "Staff Portal",
      description: "Manage bookings, leads, vendors, invoices & staff requests",
      icon: "👔",
      path: "/manager",
      color: "border-maroon hover:bg-maroon/5",
      btnClass: "bg-maroon text-white hover:bg-maroon/90 font-bold",
    },
    {
      id: "staff",
      title: "Kitchen / Operations",
      subtitle: "Staff Portal",
      description: "View events, manage stock, send supply requests",
      icon: "🍳",
      path: "/staff",
      color: "border-maroon hover:bg-maroon/5",
      btnClass: "bg-maroon text-white hover:bg-maroon/90 font-bold",
    },
    {
      id: "owner",
      title: "Owner / Admin",
      subtitle: "Super Admin",
      description:
        "Full access: analytics, branches, payments, pricing control",
      icon: "👑",
      path: "/owner",
      color: "border-maroon hover:bg-maroon/5",
      btnClass: "bg-maroon text-white hover:bg-maroon/90 font-bold",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="portal-header py-4 px-6 flex items-center">
        <img
          src="/assets/generated/logo-transparent.dim_300x100.png"
          alt="Prasad Divine Banquet"
          className="h-10 w-auto"
        />
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-background" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-accent text-lg mb-2 tracking-widest uppercase"
          >
            Welcome to
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl text-maroon font-bold mb-4"
          >
            Prasad Divine Banquet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl mb-2"
          >
            Complete Event Management System
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Choose your portal to get started
          </motion.p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={`border-2 ${role.color} h-full transition-colors cursor-pointer shadow-royal`}
                onClick={() => onNavigate(role.path)}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="text-5xl mb-4">{role.icon}</div>
                  <div className="mb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {role.subtitle}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-maroon">
                      {role.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">
                    {role.description}
                  </p>
                  <Button
                    className={`w-full h-11 ${role.btnClass}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(role.path);
                    }}
                  >
                    Open Portal →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="mt-auto text-center py-6 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()}. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-maroon hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ❤️ caffeine.ai
        </a>
      </footer>
    </div>
  );
}
