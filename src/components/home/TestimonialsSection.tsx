import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'TaskEarn is amazing! I completed all tasks in 30 minutes and got my withdrawal within hours. The interface is so smooth!', rating: 5, earned: '₹2,000' },
  { name: 'Rahul Kumar', location: 'Delhi', text: 'Very easy platform. Tasks are simple, payments are genuine. Already referred 5 friends. Best earning app!', rating: 5, earned: '₹2,000' },
  { name: 'Anita Mehra', location: 'Bangalore', text: 'I was skeptical but after my first withdrawal, I was convinced. Referred all my college friends!', rating: 5, earned: '₹2,000' },
  { name: 'Vikash Patel', location: 'Ahmedabad', text: 'Super professional platform. The tasks are fun — loved the quiz and captcha. Payment came same day!', rating: 5, earned: '₹2,000' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3">Loved By Thousands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 hover-lift animate-fade-in-up relative" style={{ animationDelay: `${i * 0.1}s` }}>
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <span className="text-sm font-bold text-gradient-primary bg-primary/10 px-3 py-1 rounded-lg">Earned {t.earned}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
