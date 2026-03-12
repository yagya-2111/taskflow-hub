import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { Users, CheckCircle, Wallet } from 'lucide-react';

function StatCard({ label, target, prefix = '', icon: Icon, gradient }: { label: string; target: number; prefix?: string; icon: any; gradient: string }) {
  const { count, ref } = useAnimatedCounter(target);
  return (
    <div ref={ref} className="glass-card p-8 text-center hover-lift group">
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7 text-primary-foreground" />
      </div>
      <div className="text-4xl md:text-5xl font-extrabold text-gradient-primary mb-2">
        {prefix}{count.toLocaleString()}+
      </div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Live Statistics</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3">Our Growing Community</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StatCard label="Total Users" target={15000} icon={Users} gradient="gradient-primary" />
          <StatCard label="Tasks Completed" target={85000} icon={CheckCircle} gradient="gradient-gold" />
          <StatCard label="Total Paid Out" target={4200000} prefix="₹" icon={Wallet} gradient="gradient-neon" />
        </div>
      </div>
    </section>
  );
}
