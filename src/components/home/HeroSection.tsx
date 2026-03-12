import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Animated bg elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5 animate-spin-slow" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-dark mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Trusted by thousands of earners</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', color: 'hsl(0 0% 95%)' }}>
            Complete Simple Tasks<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              & Earn Rewards
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s', color: 'hsl(220 10% 60%)' }}>
            Complete simple tasks and earn rewards. Start earning today with TaskEarn — the most trusted earning platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground glow-primary text-lg px-8 py-6 rounded-xl"
              onClick={() => navigate('/signup')}
            >
              Start Earning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-border/30 bg-card/5 hover:bg-card/10"
              style={{ color: 'hsl(220 10% 70%)' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
