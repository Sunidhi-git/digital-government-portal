import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Props {
  title: string;
  subtitle: string;
  badge: string;
  accent?: "primary" | "accent" | "success";
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, badge, children, footer }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left form */}
      <div className="flex flex-col">
        <div className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-border lg:border-0">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex-1 grid place-items-center px-6 lg:px-12 py-10">
          <div className="w-full max-w-md space-y-6 animate-fade-in-up">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3 w-3" /> {badge}
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
            {footer}
          </div>
        </div>
        <div className="px-6 lg:px-12 py-4 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 justify-between">
          <p>© 2026 Bharat Sewa</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="hover:text-primary">Help</Link>
          </div>
        </div>
      </div>

      {/* Right visual */}
      <div className="hidden lg:block relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(28_95%_55%_/_0.25),_transparent_55%)]" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Live · 99.2% Uptime
            </span>
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-4xl font-bold leading-tight">
              Secure, transparent &<br />
              <span className="bg-gradient-to-r from-accent to-orange-300 bg-clip-text text-transparent">paperless governance.</span>
            </h2>
            <p className="text-white/75 max-w-md">
              Bharat Sewa connects 12+ crore citizens with 850+ services across all states and union territories.
            </p>
            <ul className="space-y-3">
              {["Aadhaar-based authentication", "DigiLocker integration", "256-bit end-to-end encryption", "ISO 27001 certified infrastructure"].map((x) => (
                <li key={x} className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{v:"12.4 Cr+",l:"Citizens"},{v:"850+",l:"Services"},{v:"4.8/5",l:"Rating"}].map((s) => (
              <div key={s.l} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl py-3">
                <p className="font-display font-bold text-xl">{s.v}</p>
                <p className="text-[11px] text-white/70 uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}