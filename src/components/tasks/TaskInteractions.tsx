import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, RefreshCw, ExternalLink, HelpCircle, Puzzle } from 'lucide-react';

// ============ CAPTCHA TASK ============
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function CaptchaTask({ onComplete }: { onComplete: () => void }) {
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const verify = async () => {
    if (input.trim() === captchaCode) {
      setLoading(true);
      setError('');
      await new Promise(r => setTimeout(r, 1500));
      setSuccess(true);
      setTimeout(() => onComplete(), 800);
    } else {
      setError('Incorrect captcha. Try again!');
      setCaptchaCode(generateCaptcha());
      setInput('');
    }
  };

  if (success) return <SuccessView text="Captcha Verified!" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Type the characters shown below:</p>
      <div className="relative">
        <div className="bg-muted/50 rounded-xl p-4 text-center select-none relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 ${10 + Math.random() * 20} 30 30 Q45 ${20 + Math.random() * 20} 60 30' stroke='%23666' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
          }} />
          <span className="text-3xl font-bold tracking-[0.5em] text-foreground" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '0.4em',
            fontStyle: 'italic',
          }}>
            {captchaCode}
          </span>
        </div>
        <button
          onClick={() => { setCaptchaCode(generateCaptcha()); setInput(''); setError(''); }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <Input
        value={input}
        onChange={e => { setInput(e.target.value); setError(''); }}
        placeholder="Enter captcha code..."
        className="text-center text-lg tracking-widest"
        onKeyDown={e => e.key === 'Enter' && verify()}
      />
      {error && <p className="text-sm text-destructive animate-bounce-in">{error}</p>}
      <Button onClick={verify} className="w-full gradient-primary text-primary-foreground glow-primary" disabled={loading || !input}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Verify Captcha
      </Button>
    </div>
  );
}

// ============ FORM TASK ============
export function FormTask({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({ fullName: '', phone: '', city: '', feedback: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = formData.fullName.trim().length >= 3 && formData.phone.trim().length >= 10 && formData.city.trim().length >= 2 && formData.feedback.trim().length >= 10;

  const submit = async () => {
    if (!isValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSuccess(true);
    setTimeout(() => onComplete(), 800);
  };

  if (success) return <SuccessView text="Form Submitted!" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Fill out the verification form completely:</p>
      <div>
        <label className="text-xs font-medium text-foreground">Full Name *</label>
        <Input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter your full name" className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground">Phone Number *</label>
        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit phone number" className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground">City *</label>
        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Your city" className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground">Feedback * (min 10 chars)</label>
        <textarea
          value={formData.feedback}
          onChange={e => setFormData({ ...formData, feedback: e.target.value })}
          placeholder="Tell us about your experience..."
          className="mt-1 w-full rounded-lg border border-border bg-secondary/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
        />
      </div>
      <Button onClick={submit} className="w-full gradient-primary text-primary-foreground glow-primary" disabled={loading || !isValid}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Form
      </Button>
    </div>
  );
}

// ============ WEBSITE VISIT TASK ============
const WEBSITES = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'GitHub', url: 'https://www.github.com' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
];

export function WebsiteVisitTask({ onComplete }: { onComplete: () => void }) {
  const [website] = useState(() => WEBSITES[Math.floor(Math.random() * WEBSITES.length)]);
  const [visited, setVisited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleVisit = () => {
    window.open(website.url, '_blank');
    setVisited(true);
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const verify = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setTimeout(() => onComplete(), 800);
  };

  if (success) return <SuccessView text="Visit Verified!" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Visit the website below and click verify:</p>
      <div className="glass-card-glow p-4 text-center">
        <p className="text-lg font-bold text-foreground mb-1">{website.name}</p>
        <p className="text-xs text-muted-foreground mb-3 break-all">{website.url}</p>
        <Button onClick={handleVisit} variant="outline" className="gap-2 neon-border">
          <ExternalLink className="w-4 h-4" /> Visit Website
        </Button>
      </div>
      {visited && (
        <div className="animate-fade-in-up">
          {countdown > 0 ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Verifying visit... {countdown}s</span>
              </div>
            </div>
          ) : (
            <Button onClick={verify} className="w-full gradient-primary text-primary-foreground glow-primary" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} Verify Visit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============ QUIZ TASK ============
const QUIZ_QUESTIONS = [
  { q: 'What is the capital of India?', options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], answer: 1 },
  { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], answer: 0 },
  { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 },
  { q: 'How many bytes are in a kilobyte?', options: ['100', '512', '1000', '1024'], answer: 3 },
  { q: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
  { q: 'Which language is used for web styling?', options: ['Python', 'CSS', 'Java', 'C++'], answer: 1 },
  { q: 'What year did India gain independence?', options: ['1945', '1947', '1950', '1942'], answer: 1 },
  { q: 'What is 15 × 8?', options: ['100', '120', '110', '125'], answer: 1 },
  { q: 'Which gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
  { q: 'Who invented the light bulb?', options: ['Newton', 'Einstein', 'Edison', 'Tesla'], answer: 2 },
];

export function QuizTask({ onComplete }: { onComplete: () => void }) {
  const [question] = useState(() => QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleSubmit = async () => {
    setShowResult(true);
    if (selected === question.answer) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      setSuccess(true);
      setTimeout(() => onComplete(), 800);
    }
  };

  const retry = () => {
    setSelected(null);
    setShowResult(false);
  };

  if (success) return <SuccessView text="Correct Answer!" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-accent" />
        <p className="text-sm font-medium text-foreground">Answer correctly to complete:</p>
      </div>
      <div className="glass-card-glow p-4">
        <p className="font-bold text-foreground text-lg">{question.q}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {question.options.map((opt, i) => {
          let cls = 'glass-card p-3 cursor-pointer transition-all duration-200 text-left text-sm font-medium ';
          if (showResult && i === question.answer) cls += 'border-primary bg-primary/10 text-primary ';
          else if (showResult && i === selected && i !== question.answer) cls += 'border-destructive bg-destructive/10 text-destructive ';
          else if (selected === i) cls += 'neon-border text-primary ';
          else cls += 'hover:border-primary/30 text-foreground ';
          return (
            <button key={i} onClick={() => handleSelect(i)} className={cls}>
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && selected !== question.answer && (
        <div className="animate-bounce-in">
          <p className="text-sm text-destructive mb-2">Wrong answer! Try again.</p>
          <Button onClick={retry} variant="outline" className="w-full">Try Again</Button>
        </div>
      )}
      {!showResult && (
        <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground glow-primary" disabled={selected === null || loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Answer
        </Button>
      )}
    </div>
  );
}

// ============ PATTERN MATCH TASK ============
export function PatternMatchTask({ onComplete }: { onComplete: () => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const generatePattern = useCallback(() => {
    const p: number[] = [];
    while (p.length < 4) {
      const n = Math.floor(Math.random() * 9);
      if (!p.includes(n)) p.push(n);
    }
    return p;
  }, []);

  useEffect(() => {
    const p = generatePattern();
    setPattern(p);
    // Show pattern sequence
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < p.length) {
        setActiveCell(p[idx]);
        setTimeout(() => setActiveCell(null), 400);
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowing(false), 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (i: number) => {
    if (showing || success) return;
    const newPattern = [...userPattern, i];
    setUserPattern(newPattern);

    if (newPattern[newPattern.length - 1] !== pattern[newPattern.length - 1]) {
      setError(true);
      setTimeout(() => {
        setUserPattern([]);
        setError(false);
      }, 800);
      return;
    }

    if (newPattern.length === pattern.length) {
      setLoading(true);
      setTimeout(async () => {
        setSuccess(true);
        setTimeout(() => onComplete(), 800);
      }, 1500);
    }
  };

  if (success) return <SuccessView text="Pattern Matched!" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Puzzle className="w-5 h-5 text-accent" />
        <p className="text-sm text-muted-foreground">
          {showing ? 'Watch the pattern...' : `Repeat the pattern (${userPattern.length}/${pattern.length})`}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        {Array.from({ length: 9 }).map((_, i) => {
          const isActive = activeCell === i;
          const isUserSelected = userPattern.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              className={`aspect-square rounded-xl transition-all duration-200 ${
                isActive ? 'gradient-primary scale-110 shadow-lg' :
                error && isUserSelected ? 'bg-destructive/30 border border-destructive' :
                isUserSelected ? 'bg-primary/20 border border-primary/50' :
                'bg-secondary/50 hover:bg-secondary border border-border/50'
              }`}
            />
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive text-center animate-bounce-in">Wrong! Watch again...</p>}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Verifying...</span>
        </div>
      )}
    </div>
  );
}

// ============ SUCCESS VIEW ============
function SuccessView({ text }: { text: string }) {
  return (
    <div className="py-8 text-center animate-bounce-in">
      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
        <CheckCircle className="w-8 h-8 text-primary-foreground" />
      </div>
      <p className="text-xl font-bold text-gradient-primary">{text}</p>
      <p className="text-sm text-muted-foreground mt-1">+₹200 added to balance</p>
    </div>
  );
}
