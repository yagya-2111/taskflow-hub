import { Shield, Users, CheckCircle, Award, Zap, Lock } from 'lucide-react';

const items = [
  { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption for all transactions', color: 'gradient-primary' },
  { icon: Users, title: 'Real Users', desc: '15,000+ verified active members', color: 'gradient-neon' },
  { icon: CheckCircle, title: 'Instant Approval', desc: 'Tasks verified within seconds', color: 'gradient-gold' },
  { icon: Award, title: 'Trusted Platform', desc: 'Rated 4.9★ by our community', color: 'gradient-primary' },
  { icon: Zap, title: 'Fast Withdrawals', desc: 'Get paid directly to your UPI', color: 'gradient-sunset' },
  { icon: Lock, title: 'Anti-Fraud System', desc: 'Advanced security protection', color: 'gradient-purple' },
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3">Built on Trust & Security</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="glass-card p-6 text-center hover-lift animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
