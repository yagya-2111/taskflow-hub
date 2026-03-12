import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does TaskEarn work?', a: 'Sign up for free, deposit ₹1000 to unlock tasks, complete 5 simple verification tasks, earn ₹2000 total (₹200 per task), and withdraw to your UPI account.' },
  { q: 'Is TaskEarn safe and legitimate?', a: 'Absolutely! We use bank-grade encryption, secure authentication, and have a verified community of 15,000+ active users. All transactions are transparent.' },
  { q: 'How long does withdrawal take?', a: 'Withdrawals are processed within 24 hours after admin approval. You need to refer 2 active users who complete their deposits to unlock the withdrawal feature.' },
  { q: 'What kind of tasks are available?', a: 'We offer 5 unique tasks: Captcha verification, form submission, website visit verification, quiz questions, and pattern matching challenges. Each pays ₹200.' },
  { q: 'Can I earn more by referring friends?', a: 'Referring friends is required to unlock withdrawals. Share your unique referral link — when 2 of your referrals deposit ₹1000 each, your withdrawal gets unlocked!' },
  { q: 'What payment methods are supported?', a: 'We support all UPI payment methods for both deposits and withdrawals. Pay via Google Pay, PhonePe, Paytm, or any UPI-enabled app.' },
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Support</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-3">Frequently Asked Questions</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-none hover-lift">
              <AccordionTrigger className="text-foreground font-semibold text-left py-5">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
