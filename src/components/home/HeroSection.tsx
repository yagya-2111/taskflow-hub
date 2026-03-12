import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star, Zap, TrendingUp } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Animated bg elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-primary/8 blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/6 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-[60px] animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Orbiting rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/5 animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-accent/5 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />

        {/* Floating icons */}
        <div className="absolute top-1/4 left-[15%] animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <Star className="w-5 h-5 text-primary/60" />
          </div>
        </div>
        <div className="absolute top-1/3 right-[15%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20">
            <Zap className="w-5 h-5 text-accent/60" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-[20%] animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary/60" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="animate-fade-in-up mb-6">
            <img src={logo} alt="TaskEarn" className="h-20 md:h-28 w-auto mx-auto drop-shadow-2xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-dark mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Trusted by 15,000+ earners across India</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <span style={{ color: 'hsl(220 15% 90%)' }}>Complete Simple Tasks</span><br />
            <span className="text-gradient-primary">& Earn ₹2000</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', color: 'hsl(220 10% 55%)' }}>
            Join India's most trusted earning platform. Complete 5 easy tasks and withdraw your earnings instantly via UPI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground glow-primary text-lg px-8 py-6 rounded-xl group"
              onClick={() => navigate('/signup')}
            >
              Start Earning <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all"
              style={{ color: 'hsl(220 10% 70%)' }}
              onClick={() => navigate('/login')}
            >
              Login to Dashboard
            </Button>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Active Users', value: '15K+' },
              { label: 'Tasks Done', value: '85K+' },
              { label: 'Paid Out', value: '₹42L+' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-gradient-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
