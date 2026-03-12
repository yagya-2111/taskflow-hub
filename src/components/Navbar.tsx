import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">Task<span className="text-primary">Earn</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/referrals')}>Referrals</Button>
              <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/'); }}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button className="gradient-primary text-primary-foreground glow-primary" onClick={() => navigate('/signup')}>
                Start Earning
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-border/40 p-4 flex flex-col gap-2 animate-slide-up">
          {user ? (
            <>
              <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>Dashboard</Button>
              <Button variant="ghost" className="justify-start" onClick={() => { navigate('/referrals'); setMobileOpen(false); }}>Referrals</Button>
              <Button variant="outline" onClick={() => { signOut(); navigate('/'); setMobileOpen(false); }}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="justify-start" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Login</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={() => { navigate('/signup'); setMobileOpen(false); }}>Start Earning</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
