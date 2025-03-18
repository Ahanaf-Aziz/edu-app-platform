
import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mic, Users, Calendar, Home } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/edubot", label: "EduBot", icon: Mic },
    { path: "/edupeerx", label: "EduPeerX", icon: Users },
    { path: "/teachsmart", label: "TeachSmart", icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b backdrop-blur-sm backdrop-saturate-150 bg-background/70 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold tracking-tight">EduSuite</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "relative px-2 py-1 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-primary"
                        layoutId="navbar-indicator"
                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EduSuite. All rights reserved.</p>
        </div>
      </footer>
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t backdrop-blur-md backdrop-saturate-150 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center py-3 px-2 transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute -top-px left-0 right-0 h-0.5 bg-primary"
                      layoutId="mobile-navbar-indicator"
                      transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
