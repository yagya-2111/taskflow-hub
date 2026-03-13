import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Wallet, TrendingUp, IndianRupee, Lock, CheckCircle, Loader2, Upload, Copy, Users, Sparkles, Clock, Gift, ShieldCheck, KeyRound, FileText, Globe, HelpCircle, Puzzle, ArrowDownToLine, X, AlertCircle, UserPlus, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const DEPOSIT_AMOUNT = 500;
const TASK_REWARD = 40;
const TOTAL_EARNING = 700; // 500 + 200

type Tab = 'overview' | 'tasks' | 'referrals' | 'withdraw';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositPending, setDepositPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referralDeposits, setReferralDeposits] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab = tabParam && ['overview','tasks','referrals','withdraw'].includes(tabParam) ? tabParam : 'overview';
  const setActiveTab = (tab: Tab) => setSearchParams({ tab });

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
      setReferrals(refs);
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
        user_id: user.id, amount: DEPOSIT_AMOUNT, screenshot_url: urlData.publicUrl, status: 'pending',
      });
      if (error) throw error;
      toast.success('Deposit submitted! Awaiting admin approval.');
      setDepositPending(true);
      setShowDepositModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const createTasks = async () => {
    if (!user) return;
    const { data: existing } = await supabase.from('tasks').select('id').eq('user_id', user.id);
    if (existing && existing.length > 0) return;

    const taskInserts = TASK_TEMPLATES.map((t, i) => ({
      user_id: user.id, task_number: i + 1, task_type: t.type,
      task_data: { title: t.title, description: t.desc },
      status: 'available' as const, reward: TASK_REWARD,
    }));
    const { data, error } = await supabase.from('tasks').insert(taskInserts).select();
    if (error) { toast.error('Failed to create tasks'); return; }
    if (data) setTasks(data as any);
  };

  useEffect(() => {
    if (profile?.deposit_approved && tasks.length === 0 && !loading) createTasks();
  }, [profile?.deposit_approved, loading]);

  const completeTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({
      status: 'completed', completed_at: new Date().toISOString(),
    }).eq('id', taskId);
    if (error) { toast.error('Failed'); return; }

    const newEarnings = (profile?.total_earnings || 0) + TASK_REWARD;
    const newBalance = (profile?.available_balance || 0) + TASK_REWARD;
    const newCompleted = (profile?.tasks_completed || 0) + 1;
    await supabase.from('profiles').update({
      total_earnings: newEarnings, available_balance: newBalance, tasks_completed: newCompleted,
    }).eq('user_id', user!.id);

    toast.success(`🎉 Task completed! +₹${TASK_REWARD} earned!`);
    setActiveTask(null);
    fetchData();
  };

  const handleWithdraw = async () => {
    if (!withdrawUpi.trim()) { toast.error('Enter UPI ID'); return; }
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) { toast.error('Enter valid amount'); return; }
    if (amt > totalBalance) { toast.error('Insufficient balance'); return; }
    setWithdrawing(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user!.id, amount: amt, upi_id: withdrawUpi, status: 'pending',
      });
      if (error) throw error;
      toast.success('Withdrawal request submitted!');
      setWithdrawUpi('');
      setWithdrawAmount('');
    } catch (err: any) { toast.error(err.message); } finally { setWithdrawing(false); }
  };

  const progressPercent = (profile?.tasks_completed || 0) * 20;
  const totalBalance = (profile?.deposit_amount || 0) + (profile?.total_earnings || 0);
  const canWithdraw = profile?.withdrawal_unlocked && totalBalance > 0;

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

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: Wallet },
    { key: 'tasks', label: 'Tasks', icon: Sparkles },
    { key: 'referrals', label: 'Referrals', icon: Users },
    { key: 'withdraw', label: 'Withdraw', icon: ArrowDownToLine },
  ];

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Invest ₹{DEPOSIT_AMOUNT}, complete tasks, earn ₹{TOTAL_EARNING}.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="glass-card p-4 md:p-5 hover-lift animate-fade-in-up neon-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Deposit</span>
                <div className="text-lg md:text-xl font-bold text-foreground">₹{profile?.deposit_amount || 0}</div>
              </div>
            </div>
          </div>

          <div className="glass-card-gold p-4 md:p-5 hover-lift animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Earnings</span>
                <div className="text-lg md:text-xl font-bold text-gradient-gold">₹{profile?.total_earnings || 0}</div>
              </div>
            </div>
          </div>

          <div className="glass-card-glow p-4 md:p-5 hover-lift animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-neon flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total</span>
                <div className="text-lg md:text-xl font-bold text-gradient-primary">₹{totalBalance}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 hover-lift animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Withdrawable</span>
                <div className="text-lg md:text-xl font-bold text-foreground">₹{canWithdraw ? totalBalance : 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'gradient-primary text-primary-foreground glow-primary'
                    : 'glass-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== DEPOSIT MODAL ===== */}
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDepositModal(false)} />
            <div className="relative glass-card-glow p-6 md:p-8 max-w-sm w-full animate-scale-in rounded-2xl">
              <button onClick={() => setShowDepositModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Unlock Tasks</h3>
                <p className="text-sm text-muted-foreground mb-6">Pay ₹{DEPOSIT_AMOUNT} to unlock all 5 earning tasks and earn ₹{TOTAL_EARNING}!</p>

                <div className="glass-card p-4 mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Scan QR or Pay via UPI</p>
                  <div className="w-40 h-40 rounded-xl mx-auto overflow-hidden border-2 border-primary/20">
                    <img src="/qr-code.png" alt="UPI QR Code" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-3 bg-primary/10 rounded-lg p-3">
                    <p className="text-2xl font-bold text-primary">₹{DEPOSIT_AMOUNT}</p>
                    <p className="text-sm text-muted-foreground font-mono">UPI: yagya@unitypay</p>
                  </div>
                </div>

                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleDeposit(e.target.files[0])} />
                  <Button className="w-full gradient-primary text-primary-foreground glow-primary" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                      Upload Payment Screenshot
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Progress */}
            <div className="glass-card p-4 md:p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground text-sm md:text-base">Task Progress</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-gradient-primary">{profile?.tasks_completed || 0}/5</span>
              </div>
              <div className="relative">
                <Progress value={progressPercent} className="h-3 md:h-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] md:text-[10px] font-bold text-primary-foreground drop-shadow-sm">{progressPercent}%</span>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`text-[10px] md:text-xs font-bold ${(profile?.tasks_completed || 0) >= i ? 'text-primary' : 'text-muted-foreground'}`}>
                    T{i}
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit pending notice */}
            {!profile?.deposit_approved && depositPending && (
              <div className="glass-card-glow p-6 text-center">
                <Clock className="w-8 h-8 text-accent mx-auto mb-3 animate-float" />
                <p className="font-bold text-foreground">Payment Under Review</p>
                <p className="text-sm text-muted-foreground mt-1">Your deposit is being verified. This usually takes a few minutes.</p>
              </div>
            )}

            {/* Quick summary cards */}
            {profile?.deposit_approved ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('tasks')} className="glass-card p-5 md:p-6 text-left hover-lift transition-all">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground">Tasks</h3>
                  <p className="text-sm text-muted-foreground">{tasks.filter(t => t.status === 'completed').length}/{tasks.length} completed</p>
                </button>
                <button onClick={() => setActiveTab('referrals')} className="glass-card p-5 md:p-6 text-left hover-lift transition-all">
                  <Users className="w-7 h-7 md:w-8 md:h-8 text-accent mb-3" />
                  <h3 className="font-bold text-foreground">Referrals</h3>
                  <p className="text-sm text-muted-foreground">{referralDeposits}/2 deposited</p>
                </button>
                <button onClick={() => setActiveTab('withdraw')} className="glass-card p-5 md:p-6 text-left hover-lift transition-all">
                  <ArrowDownToLine className="w-7 h-7 md:w-8 md:h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground">Withdraw</h3>
                  <p className="text-sm text-muted-foreground">{canWithdraw ? `₹${totalBalance} available` : 'Locked'}</p>
                </button>
              </div>
            ) : !depositPending && (
              <div className="glass-card p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4 md:mb-6 animate-float">
                  <Lock className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Get Started</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Invest ₹{DEPOSIT_AMOUNT} to unlock 5 tasks and earn ₹{TOTAL_EARNING} total!</p>
                <Button className="gradient-primary text-primary-foreground glow-primary text-lg px-8 py-5" onClick={() => setShowDepositModal(true)}>
                  Unlock Tasks — ₹{DEPOSIT_AMOUNT}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-in-up">
            {!profile?.deposit_approved ? (
              <div className="glass-card p-8 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-bold text-foreground mb-2">Tasks are locked</p>
                <p className="text-sm text-muted-foreground mb-4">Pay ₹{DEPOSIT_AMOUNT} to unlock all 5 earning tasks.</p>
                {depositPending ? (
                  <div className="flex items-center justify-center gap-2 text-accent">
                    <Clock className="w-4 h-4 animate-float" />
                    <span className="text-sm font-medium">Deposit pending approval...</span>
                  </div>
                ) : (
                  <Button className="gradient-primary text-primary-foreground glow-primary" onClick={() => setShowDepositModal(true)}>
                    Unlock Tasks — ₹{DEPOSIT_AMOUNT}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Tasks</h2>
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
                        className={`${isCompleted ? 'glass-card opacity-60' : isActive ? 'glass-card-glow' : 'glass-card hover-lift'} p-5 md:p-6 transition-all duration-300 animate-fade-in-up`}
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${isCompleted ? 'bg-primary/20' : 'gradient-primary'} flex items-center justify-center`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" /> : <TaskIcon className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-primary">Task {task.task_number}</span>
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
              </>
            )}
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="animate-fade-in-up max-w-2xl mx-auto space-y-6">
            {/* Referral share card */}
            <div className="glass-card-glow p-6 md:p-8 text-center">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-4" />
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">Share & Unlock Withdrawal</h2>
              <p className="text-sm text-muted-foreground mb-6">Refer 2 friends who deposit ₹{DEPOSIT_AMOUNT} each to unlock withdrawals</p>
              <div className="flex items-center gap-2 max-w-md mx-auto">
                <Input readOnly value={referralLink} className="font-mono text-xs md:text-sm bg-muted/50" />
                <Button variant="outline" size="icon" className="neon-border shrink-0" onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast.success('Link copied!');
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Referral Progress Meter */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-foreground mb-4 text-center">Referral Progress</h3>
              <div className="flex items-center justify-center gap-6 md:gap-10">
                {[0, 1].map(i => {
                  const ref = referrals[i];
                  const joined = !!ref;
                  const deposited = ref?.deposit_completed;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                        deposited ? 'border-primary bg-primary/20 animate-glow-pulse' :
                        joined ? 'border-accent bg-accent/10' :
                        'border-muted bg-muted/20'
                      }`}>
                        {deposited ? (
                          <UserCheck className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                        ) : joined ? (
                          <UserPlus className="w-7 h-7 md:w-8 md:h-8 text-accent" />
                        ) : (
                          <Users className="w-7 h-7 md:w-8 md:h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground">Referral {i + 1}</p>
                        <p className={`text-[10px] font-medium ${
                          deposited ? 'text-primary' : joined ? 'text-accent' : 'text-muted-foreground'
                        }`}>
                          {deposited ? '✅ Deposit Confirmed' : joined ? '⏳ Joined, No Deposit' : 'Not Joined'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="mt-6 max-w-xs mx-auto">
                <Progress value={referralDeposits * 50} className="h-3" />
                <p className="text-xs text-muted-foreground text-center mt-2">{referralDeposits}/2 completed referrals</p>
              </div>
            </div>

            {/* Referral list */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-foreground mb-4">Your Referrals ({referrals.length})</h3>
              {referrals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No referrals yet. Share your link!</p>
              ) : (
                <div className="space-y-3">
                  {referrals.map(ref => (
                    <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ref.deposit_completed ? 'bg-primary/20' : 'bg-accent/10'}`}>
                          {ref.deposit_completed ? <UserCheck className="w-4 h-4 text-primary" /> : <UserPlus className="w-4 h-4 text-accent" />}
                        </div>
                        <span className="text-sm text-foreground">User #{ref.referred_user_id.slice(0, 8)}</span>
                      </div>
                      {ref.deposit_completed ? (
                        <span className="flex items-center gap-1 text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Deposited</span>
                      ) : (
                        <span className="flex items-center gap-1 text-accent text-xs font-bold bg-accent/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Joined</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="animate-fade-in-up max-w-lg mx-auto">
            <div className="glass-card p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-gold flex items-center justify-center">
                    <ArrowDownToLine className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Withdraw Funds</h2>
                    <p className="text-xs text-muted-foreground">Available: ₹{canWithdraw ? totalBalance : 0}</p>
                  </div>
                </div>

                {/* Balance breakdown */}
                <div className="glass-card p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="text-foreground font-semibold">₹{profile?.deposit_amount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Task Earnings ({TASK_REWARD}×5)</span>
                    <span className="text-foreground font-semibold">₹{profile?.total_earnings || 0}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="text-foreground font-bold">Total Balance</span>
                    <span className="font-bold text-gradient-primary">₹{totalBalance}</span>
                  </div>
                </div>

                {!profile?.withdrawal_unlocked ? (
                  <div className="text-center py-4">
                    <Lock className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-bold text-foreground mb-2">Withdrawal Locked</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                      Refer 2 users who each deposit ₹{DEPOSIT_AMOUNT} to unlock.
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
                    <Button className="mt-4" variant="outline" onClick={() => setActiveTab('referrals')}>Go to Referrals</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">UPI ID</label>
                      <Input value={withdrawUpi} onChange={e => setWithdrawUpi(e.target.value)} placeholder="yourname@upi" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                      <Input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" placeholder={`Max ₹${totalBalance}`} className="mt-1" />
                    </div>
                    <Button className="w-full gradient-primary text-primary-foreground glow-primary" disabled={withdrawing || !canWithdraw} onClick={handleWithdraw}>
                      {withdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Withdrawal Request
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
