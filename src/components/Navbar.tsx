import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Shield, LayoutDashboard, Users, Home, Sparkles, ArrowDownToLine } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').then(({ data }) => {
        setIsAdmin(data && data.length > 0 ? true : false);
      });
    }
  }, [user]);

  const navItems = user ? [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Tasks', icon: Sparkles, path: '/dashboard?tab=tasks' },
    { label: 'Referrals', icon: Users, path: '/dashboard?tab=referrals' },
    { label: 'Withdraw', icon: ArrowDownToLine, path: '/dashboard?tab=withdraw' },
  ] : [];

  const isActive = (path: string) => {
    if (path.includes('?tab=')) {
      const tab = path.split('tab=')[1];
      return location.search.includes(`tab=${tab}`);
    }
    return location.pathname === path && !location.search.includes('tab=');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30" style={{ background: 'rgba(10, 12, 20, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <img src={logo} alt="TaskEarn" className="h-9 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              {navItems.map(item => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`gap-1.5 ${isActive(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-1.5 text-accent hover:text-accent">
                  <Shield className="w-4 h-4" /> Admin
                </Button>
              )}
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="gap-1.5 text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">Login</Button>
              <Button size="sm" className="gradient-primary text-primary-foreground glow-primary ml-2" onClick={() => navigate('/signup')}>
                Start Earning
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 p-4 flex flex-col gap-1 animate-fade-in" style={{ background: 'rgba(10, 12, 20, 0.95)' }}>
          {user ? (
            <>
              {navItems.map(item => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`justify-start gap-2 ${isActive(item.path) ? 'text-primary bg-primary/10' : ''}`}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button variant="ghost" className="justify-start gap-2 text-accent" onClick={() => { navigate('/admin'); setMobileOpen(false); }}>
                  <Shield className="w-4 h-4" /> Admin Panel
                </Button>
              )}
              <div className="h-px bg-border my-2" />
              <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={() => { signOut(); navigate('/'); setMobileOpen(false); }}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="justify-start" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Login</Button>
              <Button className="gradient-primary text-primary-foreground mt-2" onClick={() => { navigate('/signup'); setMobileOpen(false); }}>Start Earning</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
