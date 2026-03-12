import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Wallet, TrendingUp, IndianRupee, Lock, CheckCircle, Loader2, Upload, ArrowDownToLine, Copy, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  { type: 'captcha', title: 'Captcha Verification', desc: 'Complete a captcha challenge' },
  { type: 'form', title: 'Form Submission', desc: 'Fill and submit a verification form' },
  { type: 'visit', title: 'Website Visit', desc: 'Visit and verify a website' },
  { type: 'quiz', title: 'Quiz Question', desc: 'Answer a quick quiz' },
  { type: 'verify', title: 'Random Verification', desc: 'Complete a verification task' },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositPending, setDepositPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
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
    // Fetch profile
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    if (p) setProfile(p as any);

    // Fetch tasks
    const { data: t } = await supabase.from('tasks').select('*').eq('user_id', user!.id).order('task_number');
    if (t && t.length > 0) setTasks(t as any);

    // Check pending deposit
    const { data: dep } = await supabase.from('deposits').select('status').eq('user_id', user!.id).eq('status', 'pending');
    setDepositPending((dep && dep.length > 0) || false);

    // Fetch referrals
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
        user_id: user.id,
        amount: 1000,
        screenshot_url: urlData.publicUrl,
        status: 'pending',
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
      user_id: user.id,
      task_number: i + 1,
      task_type: t.type,
      task_data: { title: t.title, description: t.desc },
      status: 'available' as const,
      reward: 200,
    }));
    const { data, error } = await supabase.from('tasks').insert(taskInserts).select();
    if (error) { toast.error('Failed to create tasks'); return; }
    if (data) setTasks(data as any);
  };

  useEffect(() => {
    if (profile?.deposit_approved && tasks.length === 0) {
      createTasks();
    }
  }, [profile?.deposit_approved]);

  const completeTask = async (taskId: string) => {
    setCompletingTask(taskId);
    // Simulate task completion with 2s delay
    await new Promise(r => setTimeout(r, 2000));

    const { error } = await supabase.from('tasks').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', taskId);
    if (error) { toast.error('Failed'); setCompletingTask(null); return; }

    // Update profile
    const newEarnings = (profile?.total_earnings || 0) + 200;
    const newBalance = (profile?.available_balance || 0) + 200;
    const newCompleted = (profile?.tasks_completed || 0) + 1;
    await supabase.from('profiles').update({
      total_earnings: newEarnings,
      available_balance: newBalance,
      tasks_completed: newCompleted,
    }).eq('user_id', user!.id);

    toast.success('Task completed! +₹200 earned!');
    setCompletingTask(null);
    fetchData();
  };

  const handleWithdraw = async () => {
    if (!withdrawUpi.trim()) { toast.error('Enter UPI ID'); return; }
    setWithdrawing(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user!.id,
        amount: Number(withdrawAmount),
        upi_id: withdrawUpi,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Withdrawal request submitted!');
      setWithdrawUpi('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const progressPercent = (profile?.tasks_completed || 0) * 20;
  const canWithdraw = profile?.withdrawal_unlocked && (profile?.available_balance || 0) >= 2000;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Deposit Amount</span>
            </div>
            <div className="text-3xl font-bold text-foreground">₹{profile?.deposit_amount || 0}</div>
          </div>
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
            <div className="text-3xl font-bold text-foreground">₹{profile?.total_earnings || 0}</div>
          </div>
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Available Balance</span>
            </div>
            <div className="text-3xl font-bold text-primary">₹{profile?.available_balance || 0}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-foreground">Task Progress</span>
            <span className="text-sm text-muted-foreground">{profile?.tasks_completed || 0}/5 completed</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">{progressPercent}% complete — Each task earns ₹200</p>
        </div>

        {/* Deposit Section */}
        {!profile?.deposit_approved && (
          <div className="glass-card p-8 mb-8 text-center animate-fade-in-up">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Unlock Your Tasks</h2>
            <p className="text-muted-foreground mb-6">Deposit ₹1000 to unlock all 5 earning tasks</p>
            {depositPending ? (
              <div className="bg-accent/10 text-accent-foreground rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent" />
                <p className="font-semibold">Deposit submitted — awaiting admin approval</p>
              </div>
            ) : (
              <div>
                <div className="glass-card p-6 max-w-xs mx-auto mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Scan QR or pay via UPI</p>
                  <div className="w-40 h-40 bg-muted rounded-lg mx-auto flex items-center justify-center text-muted-foreground text-sm">
                    UPI QR Code
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Amount: ₹1000</p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleDeposit(e.target.files[0])}
                  />
                  <Button className="gradient-primary text-primary-foreground glow-primary" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Payment Screenshot
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Tasks */}
        {profile?.deposit_approved && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <div key={task.id} className={`glass-card p-6 transition-all duration-300 ${task.status === 'completed' ? 'opacity-70' : 'hover:-translate-y-1'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Task {task.task_number}</span>
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <span className="text-xs text-accent font-bold">₹{task.reward}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{(task.task_data as any)?.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{(task.task_data as any)?.description}</p>
                  {task.status === 'completed' ? (
                    <Button variant="secondary" className="w-full" disabled>Completed ✓</Button>
                  ) : (
                    <Button
                      className="w-full gradient-primary text-primary-foreground"
                      disabled={completingTask === task.id}
                      onClick={() => completeTask(task.id)}
                    >
                      {completingTask === task.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                      ) : (
                        'Complete Task'
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ArrowDownToLine className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
          </div>
          {!profile?.withdrawal_unlocked ? (
            <div className="text-center py-4">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">Withdrawal is locked</p>
              <p className="text-sm text-muted-foreground">
                Refer 2 users who each deposit ₹1000 to unlock. 
                <br />Progress: <strong>{referralDeposits}/2</strong> referral deposits completed.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <Label>UPI ID</Label>
                <Input value={withdrawUpi} onChange={e => setWithdrawUpi(e.target.value)} placeholder="yourname@upi" className="mt-1" />
              </div>
              <div>
                <Label>Amount</Label>
                <Input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number" min={2000} className="mt-1" />
              </div>
              <Button
                className="gradient-primary text-primary-foreground glow-primary"
                disabled={withdrawing || !canWithdraw}
                onClick={handleWithdraw}
              >
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Withdrawal
              </Button>
            </div>
          )}
        </div>

        {/* Referral quick info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Your Referral Link</h3>
          </div>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/?ref=${profile?.referral_code || ''}`}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile?.referral_code || ''}`);
                toast.success('Copied!');
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Referred: {referralCount} users | Deposits: {referralDeposits}/2</p>
        </div>
      </div>
    </div>
  );
}
