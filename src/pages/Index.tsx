import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import TrustSection from '@/components/home/TrustSection';
import StatsSection from '@/components/home/StatsSection';
import StepsSection from '@/components/home/StepsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import logo from '@/assets/logo.png';

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <StatsSection />
      <StepsSection />
      <TestimonialsSection />
      <FAQSection />
      <footer className="py-8 bg-secondary/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={logo} alt="TaskEarn" className="h-10 w-auto" />
        </div>
        <p className="text-sm text-muted-foreground">© 2026 TaskEarn. All rights reserved.</p>
      </footer>
    </div>
  );
}
