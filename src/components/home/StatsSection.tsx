import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

function StatCard({ label, target, prefix = '' }: { label: string; target: number; prefix?: string }) {
  const { count, ref } = useAnimatedCounter(target);
  return (
    <div ref={ref} className="glass-card p-8 text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2 animate-counter">
        {prefix}{count.toLocaleString()}+
      </div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Our Growing Community</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StatCard label="Total Users" target={15000} />
          <StatCard label="Tasks Completed" target={85000} />
          <StatCard label="Total Withdrawals" target={42000} prefix="₹" />
        </div>
      </div>
    </section>
  );
}
