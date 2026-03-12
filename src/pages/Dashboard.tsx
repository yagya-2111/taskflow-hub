import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Wallet, TrendingUp, IndianRupee, Lock, CheckCircle, Loader2, Upload, ArrowDownToLine, Copy, Users, Sparkles, Clock, Gift, ShieldCheck, KeyRound, FileText, Globe, HelpCircle, Puzzle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CaptchaTask, FormTask, WebsiteVisitTask, QuizTask, PatternMatchTask } from '@/components/tasks/TaskInteractions';
import logo from '@/assets/logo.png';

interface Profile {
  deposit_amount: number;
  total_earnings: number;
  available_balance: number;
  tasks_completed: number;
  deposit_approved: boolean;
  withdrawal_unlocked: boolean;
  referral_code: string;
}

interface Task {
  id: string;
  task_number: number;
  task_type: string;
  task_data: any;
  reward: number;
  status: string;
}

const TASK_TEMPLATES = [
  { type: 'captcha', title: 'Captcha Verification', desc: 'Type the captcha code correctly', icon: KeyRound },
  { type: 'form', title: 'Form Submission', desc: 'Fill out a verification form', icon: FileText },
  { type: 'visit', title: 'Website Visit', desc: 'Visit a website & verify', icon: Globe },
  { type: 'quiz', title: 'Quiz Challenge', desc: 'Answer an MCQ correctly', icon: HelpCircle },
  { type: 'verify', title: 'Pattern Match', desc: 'Remember & repeat a pattern', icon: Puzzle },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositPending, setDepositPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [withdrawing, setWithdrawing] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referralDeposits, setReferralDeposits] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    if (p) setProfile(p as any);

    const { data: t } = await supabase.from('tasks').select('*').eq('user_id', user!.id).order('task_number');
    setTasks((t && t.length > 0) ? (t as any) : []);

    const { data: dep } = await supabase.from('deposits').select('status').eq('user_id', user!.id).eq('status', 'pending');
    setDepositPending((dep && dep.length > 0) || false);

    const { data: refs } = await supabase.from('referrals').select('*').eq('referrer_id', user!.id);
    if (refs) {
      setReferralCount(refs.length);
      setReferralDeposits(refs.filter(r => r.deposit_completed).length);
    }
    setLoading(false);
  };

  const handleDeposit = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('deposit-screenshots').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('deposit-screenshots').getPublicUrl(filePath);
      const { error } = await supabase.from('deposits').insert({
        user_id: user.id, amount: 1000, screenshot_url: urlData.publicUrl, status: 'pending',
      });
      if (error) throw error;
      toast.success('Deposit submitted! Awaiting admin approval.');
      setDepositPending(true);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const createTasks = async () => {
    if (!user) return;
    const taskInserts = TASK_TEMPLATES.map((t, i) => ({
      user_id: user.id, task_number: i + 1, task_type: t.type,
      task_data: { title: t.title, description: t.desc },
      status: 'available' as const, reward: 200,
    }));
    const { data, error } = await supabase.from('tasks').insert(taskInserts).select();
    if (error) { toast.error('Failed to create tasks'); return; }
    if (data) setTasks(data as any);
  };

  useEffect(() => {
    if (profile?.deposit_approved && tasks.length === 0) createTasks();
  }, [profile?.deposit_approved]);

  const completeTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({
      status: 'completed', completed_at: new Date().toISOString(),
    }).eq('id', taskId);
    if (error) { toast.error('Failed'); return; }

    const newEarnings = (profile?.total_earnings || 0) + 200;
    const newBalance = (profile?.available_balance || 0) + 200;
    const newCompleted = (profile?.tasks_completed || 0) + 1;
    await supabase.from('profiles').update({
      total_earnings: newEarnings, available_balance: newBalance, tasks_completed: newCompleted,
    }).eq('user_id', user!.id);

    toast.success('🎉 Task completed! +₹200 earned!');
    setActiveTask(null);
    fetchData();
  };

  const handleWithdraw = async () => {
    if (!withdrawUpi.trim()) { toast.error('Enter UPI ID'); return; }
    setWithdrawing(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user!.id, amount: Number(withdrawAmount), upi_id: withdrawUpi, status: 'pending',
      });
      if (error) throw error;
      toast.success('Withdrawal request submitted!');
      setWithdrawUpi('');
    } catch (err: any) { toast.error(err.message); } finally { setWithdrawing(false); }
  };

  const progressPercent = (profile?.tasks_completed || 0) * 20;
  const canWithdraw = profile?.withdrawal_unlocked && (profile?.available_balance || 0) >= 2000;

  const getTaskIcon = (type: string) => {
    const template = TASK_TEMPLATES.find(t => t.type === type);
    return template?.icon || KeyRound;
  };

  const renderTaskInteraction = (task: Task) => {
    const onComplete = () => completeTask(task.id);
    switch (task.task_type) {
      case 'captcha': return <CaptchaTask onComplete={onComplete} />;
      case 'form': return <FormTask onComplete={onComplete} />;
      case 'visit': return <WebsiteVisitTask onComplete={onComplete} />;
      case 'quiz': return <QuizTask onComplete={onComplete} />;
      case 'verify': return <PatternMatchTask onComplete={onComplete} />;
      default: return <CaptchaTask onComplete={onComplete} />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={logo} alt="TaskEarn" className="h-16 w-auto mx-auto mb-4 animate-float" />
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back! Complete tasks and earn rewards.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="glass-card p-6 hover-lift animate-fade-in-up neon-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Deposit</span>
                <div className="text-2xl font-bold text-foreground">₹{profile?.deposit_amount || 0}</div>
              </div>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-primary rounded-full" style={{ width: profile?.deposit_approved ? '100%' : '0%', transition: 'width 1s ease' }} />
            </div>
          </div>

          <div className="glass-card-gold p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Earnings</span>
                <div className="text-2xl font-bold text-gradient-gold">₹{profile?.total_earnings || 0}</div>
              </div>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-gold rounded-full" style={{ width: `${progressPercent}%`, transition: 'width 1s ease' }} />
            </div>
          </div>

          <div className="glass-card-glow p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl gradient-neon flex items-center justify-center shadow-lg">
                <IndianRupee className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Balance</span>
                <div className="text-2xl font-bold text-gradient-primary">₹{profile?.available_balance || 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gift className="w-3 h-3" />
              <span>{canWithdraw ? 'Ready to withdraw!' : 'Complete tasks to earn'}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">Task Progress</span>
            </div>
            <span className="text-sm font-bold text-gradient-primary">{profile?.tasks_completed || 0}/5 completed</span>
          </div>
          <div className="relative">
            <Progress value={progressPercent} className="h-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground drop-shadow-sm">{progressPercent}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`text-xs font-bold ${(profile?.tasks_completed || 0) >= i ? 'text-primary' : 'text-muted-foreground'}`}>
                Task {i}
              </div>
            ))}
          </div>
        </div>

        {/* Deposit Section */}
        {!profile?.deposit_approved && (
          <div className="glass-card p-8 mb-8 text-center animate-fade-in-up relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6 animate-float">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Your Earning Tasks</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Deposit ₹1000 to unlock all 5 earning tasks. Complete them all to earn ₹2000!</p>
              {depositPending ? (
                <div className="glass-card-glow p-6 max-w-sm mx-auto">
                  <Clock className="w-8 h-8 text-accent mx-auto mb-3 animate-float" />
                  <p className="font-bold text-foreground">Payment Under Review</p>
                  <p className="text-sm text-muted-foreground mt-1">Your deposit is being verified by our team. This usually takes a few minutes.</p>
                </div>
              ) : (
                <div>
                  <div className="glass-card p-6 max-w-xs mx-auto mb-6">
                    <p className="text-sm font-medium text-foreground mb-3">Scan QR or Pay via UPI</p>
                    <div className="w-44 h-44 bg-muted/30 rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-border">
                      <span className="text-muted-foreground text-sm">UPI QR Code</span>
                    </div>
                    <div className="mt-3 bg-primary/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-primary">₹1,000</p>
                    </div>
                  </div>
                  <label className="cursor-pointer inline-block">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleDeposit(e.target.files[0])} />
                    <Button className="gradient-primary text-primary-foreground glow-primary text-lg px-8 py-6" disabled={uploading} asChild>
                      <span>
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                        Upload Payment Screenshot
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks */}
        {profile?.deposit_approved && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Tasks</h2>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{tasks.filter(t => t.status === 'completed').length}/{tasks.length} Done</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, i) => {
                const TaskIcon = getTaskIcon(task.task_type);
                const isActive = activeTask === task.id;
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`${isCompleted ? 'glass-card opacity-60' : isActive ? 'glass-card-glow' : 'glass-card hover-lift'} p-6 transition-all duration-300 animate-fade-in-up`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${isCompleted ? 'bg-primary/20' : 'gradient-primary'} flex items-center justify-center`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5 text-primary" /> : <TaskIcon className="w-5 h-5 text-primary-foreground" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary">Task {task.task_number}</span>
                          <h3 className="font-bold text-foreground text-sm">{(task.task_data as any)?.title}</h3>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isCompleted ? 'text-primary' : 'text-gradient-gold'}`}>
                        {isCompleted ? '✓' : `₹${task.reward}`}
                      </span>
                    </div>

                    {isActive ? (
                      <div className="animate-fade-in-up">
                        {renderTaskInteraction(task)}
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Completed & Verified</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-muted-foreground mb-4">{(task.task_data as any)?.description}</p>
                        <Button
                          className="w-full gradient-primary text-primary-foreground glow-primary"
                          onClick={() => setActiveTask(task.id)}
                        >
                          Start Task
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Withdrawal */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
                <p className="text-xs text-muted-foreground">Minimum withdrawal: ₹2000</p>
              </div>
            </div>
            {!profile?.withdrawal_unlocked ? (
              <div className="text-center py-6">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-bold text-foreground mb-2">Withdrawal Locked</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Refer 2 users who each deposit ₹1000 to unlock withdrawals.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="glass-card px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-gradient-primary">{referralDeposits}</p>
                    <p className="text-xs text-muted-foreground">of 2 required</p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-full ${referralDeposits > i ? 'bg-primary animate-glow-pulse' : 'bg-muted'}`} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div>
                  <Label className="text-foreground">UPI ID</Label>
                  <Input value={withdrawUpi} onChange={e => setWithdrawUpi(e.target.value)} placeholder="yourname@upi" className="mt-1" />
                </div>
                <div>
                  <Label className="text-foreground">Amount (₹)</Label>
                  <Input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" min={2000} className="mt-1" />
                </div>
                <Button className="gradient-primary text-primary-foreground glow-primary" disabled={withdrawing || !canWithdraw} onClick={handleWithdraw}>
                  {withdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Withdrawal Request
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Referral */}
        <div className="glass-card-glow p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Referral Program</h3>
                <p className="text-xs text-muted-foreground">Share your link & unlock withdrawals</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Input readOnly value={`${window.location.origin}/signup?ref=${profile?.referral_code || ''}`} className="font-mono text-sm bg-muted/50" />
              <Button variant="outline" size="icon" className="neon-border shrink-0" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${profile?.referral_code || ''}`);
                toast.success('Link copied!');
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary" /> {referralCount} referred</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-accent" /> {referralDeposits} deposited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
