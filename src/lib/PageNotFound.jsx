import { Link, useLocation } from 'react-router-dom';
import { Radio } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="crt-overlay" />
      <div className="max-w-md w-full relative z-10 text-center space-y-6">
        <div className="space-y-2">
          <Radio className="w-10 h-10 text-primary mx-auto text-glow" />
          <h1 className="font-display text-6xl text-primary/40 tracking-wider">404</h1>
          <div className="h-px w-16 bg-primary/30 mx-auto" />
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-lg text-primary tracking-wider">FREQUENCY NOT FOUND</h2>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            No facility is assigned to route <span className="text-primary">/{pageName}</span>.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-2 font-display text-xs tracking-wider text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
        >
          RETURN TO MENU
        </Link>
      </div>
    </div>
  );
}
