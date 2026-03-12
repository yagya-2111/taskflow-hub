import { UserPlus, Wallet, ClipboardList, IndianRupee, ArrowDownToLine } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds for free', reward: null },
  { icon: Wallet, title: 'Deposit ₹1000', desc: 'Unlock all earning tasks', reward: null },
  { icon: ClipboardList, title: 'Complete 5 Tasks', desc: 'Simple verification tasks', reward: '₹200/task' },
  { icon: IndianRupee, title: 'Earn ₹2000', desc: 'Double your investment', reward: '₹2000' },
  { icon: ArrowDownToLine, title: 'Withdraw Money', desc: 'Direct to your UPI account', reward: null },
];

export default function StepsSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple Process</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3">How It Works</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Start earning in 5 simple steps — no experience needed</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start gap-6 mb-8 last:mb-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-lg relative">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="glass-card p-5 flex-1 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                  {step.reward && (
                    <span className="text-sm font-bold text-gradient-gold bg-accent/10 px-3 py-1 rounded-lg">{step.reward}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
