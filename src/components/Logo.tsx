import { Link } from "react-router-dom";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative h-10 w-10 rounded-xl gradient-primary grid place-items-center shadow-glow group-hover:scale-105 transition-smooth">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            const x1 = 12 + Math.cos(a) * 4;
            const y1 = 12 + Math.sin(a) * 4;
            const x2 = 12 + Math.cos(a) * 8.5;
            const y2 = 12 + Math.sin(a) * 8.5;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.2" />;
          })}
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`font-display font-bold text-lg tracking-tight ${light ? "text-white" : "text-foreground"}`}>
          Bharat<span className="text-accent">Sewa</span>
        </div>
        <div className={`text-[10px] font-medium uppercase tracking-wider ${light ? "text-white/70" : "text-muted-foreground"}`}>
          Government of India
        </div>
      </div>
    </Link>
  );
}