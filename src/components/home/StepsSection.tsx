import { UserPlus, Wallet, ClipboardList, IndianRupee, ArrowDownToLine } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in seconds' },
  { icon: Wallet, title: 'Deposit ₹1000', desc: 'Unlock your earning tasks' },
  { icon: ClipboardList, title: 'Complete 5 Tasks', desc: 'Simple verification tasks' },
  { icon: IndianRupee, title: 'Earn ₹2000', desc: 'Get ₹200 per task' },
  { icon: ArrowDownToLine, title: 'Withdraw Money', desc: 'Direct to your UPI' },
];

export default function StepsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">Start earning in 5 simple steps</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <div className="glass-card p-6 text-center w-48 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-xs font-bold text-primary mb-1">Step {i + 1}</div>
                <h3 className="font-bold text-foreground text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block w-8 h-0.5 bg-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
