import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How does TaskEarn work?', a: 'Sign up, deposit ₹1000 to unlock tasks, complete 5 simple tasks, earn ₹2000, and withdraw to your UPI account.' },
  { q: 'Is TaskEarn safe?', a: 'Yes! We use bank-grade encryption and Supabase authentication to keep your data and funds secure.' },
  { q: 'How long does withdrawal take?', a: 'Withdrawals are processed within 24 hours after admin approval. You need to refer 2 users who deposit to unlock withdrawals.' },
  { q: 'What kind of tasks are there?', a: 'Tasks include captcha filling, form submissions, website visits, quiz questions, and verification tasks.' },
  { q: 'Can I earn more by referring friends?', a: 'Yes! Referring friends helps unlock your withdrawal. Share your referral link and earn together.' },
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card px-6 border-none">
              <AccordionTrigger className="text-foreground font-semibold text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
