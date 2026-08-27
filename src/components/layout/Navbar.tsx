import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { Menu, X, ChevronDown, Shield, Users, UserCog } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/useSession";
import { dashboardPath } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/track", label: "Track Application" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="w-full flex h-16 items-center justify-between gap-4 px-0">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                  isActive ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button onClick={() => nav(dashboardPath(user.role))} className="hidden sm:inline-flex gradient-primary text-white shadow-md hover:opacity-95">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:inline-flex gap-1">
                    Login <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => nav("/login")}><Users className="h-4 w-4 mr-2" />Citizen Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/officer-login")}><UserCog className="h-4 w-4 mr-2" />Officer Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/admin-login")}><Shield className="h-4 w-4 mr-2" />Admin Login</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => nav("/register")} className="hidden sm:inline-flex gradient-primary text-white shadow-md hover:opacity-95">
                Register
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {user ? (
              <Button onClick={() => { setOpen(false); nav(dashboardPath(user.role)); }} className="gradient-primary text-white">Go to Dashboard</Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); nav("/login"); }}>Citizen Login</Button>
                <Button onClick={() => { setOpen(false); nav("/register"); }} className="gradient-primary text-white">Register</Button>
                <Button variant="outline" onClick={() => { setOpen(false); nav("/officer-login"); }}>Officer</Button>
                <Button variant="outline" onClick={() => { setOpen(false); nav("/admin-login"); }}>Admin</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}