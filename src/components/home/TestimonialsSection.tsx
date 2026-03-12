import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Priya S.', text: 'TaskEarn is amazing! I completed all tasks in 30 minutes and got my withdrawal within hours.', rating: 5 },
  { name: 'Rahul K.', text: 'Very easy to use platform. The tasks are simple and payments are genuine. Highly recommended!', rating: 5 },
  { name: 'Anita M.', text: 'I was skeptical at first, but after my first successful withdrawal, I referred all my friends!', rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">"{t.text}"</p>
              <p className="font-bold text-foreground">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
