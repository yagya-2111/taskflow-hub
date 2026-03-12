import { Shield, Users, CheckCircle, Award } from 'lucide-react';

const items = [
  { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption' },
  { icon: Users, title: 'Real Users', desc: 'Verified community' },
  { icon: CheckCircle, title: 'Instant Approval', desc: 'Quick task verification' },
  { icon: Award, title: 'Trusted Platform', desc: '1000+ happy earners' },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="glass-card p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
