import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, FolderOpen, MessageSquareWarning, Bell, CreditCard,
  Search, LogOut, Menu, X, Users, ShieldCheck, Settings, BarChart3, FileCheck2,
  UserCog, Building2, ClipboardList,
  User,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "@/hooks/useSession";
import { Role } from "@/lib/auth";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navByRole: Record<Role, { to: string; label: string; icon: any }[]> = {
  citizen: [
    { to: "/citizen", label: "Dashboard", icon: LayoutDashboard },
    { to: "/services", label: "Apply for Services", icon: FileText },
    { to: "/applications", label: "My Applications", icon: ClipboardList },
    { to: "/documents", label: "My Documents", icon: FolderOpen },
    { to: "/payments", label: "Payments", icon: CreditCard },
    { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/track", label: "Track Status", icon: Search },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "My Profile", icon: User },
  ],
  officer: [
    { to: "/officer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/officer/queue", label: "Application Queue", icon: ClipboardList },
    { to: "/officer/verify", label: "Document Verification", icon: FileCheck2 },
    { to: "/officer/citizens", label: "Citizen Requests", icon: Users },
    { to: "/officer/analytics", label: "Department Analytics", icon: BarChart3 },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/citizens", label: "Manage Citizens", icon: Users },
    { to: "/admin/officers", label: "Manage Officers", icon: UserCog },
    { to: "/admin/services", label: "Manage Services", icon: Building2 },
    { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
    { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const titles: Record<Role, string> = {
  citizen: "Citizen Portal",
  officer: "Officer Workspace",
  admin: "Admin Console",
};

export function PortalLayout({ children, role }: { children: ReactNode; role: Role }) {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const nav = useNavigate();
  const items = navByRole[role];

  const handleLogout = async () => { await signOut(); };

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <Logo light />
        </div>

        <div className="px-4 py-4">
          <div className="px-3 py-2.5 rounded-xl bg-sidebar-accent/60 flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/30">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
                {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "BS"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "Guest"}</p>
              <p className="text-[11px] text-sidebar-foreground/60 truncate">{titles[role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto pb-4">
          <p className="px-3 pb-2 text-[11px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold">Main Menu</p>
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.to === `/${role}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`
                  }
                >
                  <it.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{it.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-background/85 backdrop-blur-lg border-b border-border flex items-center px-4 lg:px-8 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Menu />}
          </Button>

          <div className="hidden md:flex items-center gap-2 max-w-md flex-1 mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search services, applications, docs..." className="pl-9 bg-secondary/60 border-transparent focus-visible:bg-background" />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="hidden sm:inline-flex bg-success/10 text-success border-success/20">
              <ShieldCheck className="h-3 w-3 mr-1" /> Secure Session
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => nav("/notifications")} className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                      {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "BS"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{user?.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav("/")}>Home</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/notifications")}>Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}