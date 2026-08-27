import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed">
            India's unified digital portal for citizen services — secure, transparent, paperless governance.
          </p>
          <div className="flex gap-2">
            {[Facebook, Twitter, Youtube].map((I, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-lg bg-background border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Services</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {["Passport", "Driving License", "Certificates", "Tax Payment", "PAN Card"].map((x) => (
              <li key={x}><Link to="/services" className="hover:text-primary transition-smooth">{x}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/track" className="hover:text-primary">Track Application</Link></li>
            <li><Link to="/complaints" className="hover:text-primary">File Complaint</Link></li>
            <li><Link to="/notifications" className="hover:text-primary">Notifications</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-4">Helpdesk</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary" /> 1800-XXX-1947 (Toll-free)</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary" /> support@bharatsewa.gov.in</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" /> Sansad Marg, New Delhi - 110001</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Bharat Sewa · Government of India. All Rights Reserved.</p>
          <p>Designed & Developed under Digital India Mission.</p>
        </div>
      </div>
    </footer>
  );
}