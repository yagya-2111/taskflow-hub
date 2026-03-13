import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import TrustSection from '@/components/home/TrustSection';
import StatsSection from '@/components/home/StatsSection';
import StepsSection from '@/components/home/StepsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <StatsSection />
      <StepsSection />
      <TestimonialsSection />
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Ready to Invest ₹500 & Earn ₹700?</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md mx-auto px-4">Join 15,000+ users earning with TaskEarn. Complete 5 tasks, withdraw instantly.</p>
          <Button size="lg" className="gradient-primary text-primary-foreground glow-primary text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-xl group" onClick={() => navigate('/signup')}>
            Create Free Account <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <footer className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TaskEarn" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground">© 2026 TaskEarn. All rights reserved. India's most trusted earning platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
