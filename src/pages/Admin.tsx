import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editValues, setEditValues] = useState({ deposit_amount: 0, total_earnings: 0, available_balance: 0 });

  // Manual history
  const [manualType, setManualType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [manualUserId, setManualUserId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualUpi, setManualUpi] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (user) checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user!.id).eq('role', 'admin');
    if (data && data.length > 0) {
      setIsAdmin(true);
      fetchAll();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    const [u, d, w] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('deposits').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers(u.data || []);
    setDeposits(d.data || []);
    setWithdrawals(w.data || []);
    setLoading(false);
  };

  const approveDeposit = async (dep: any) => {
    await supabase.from('deposits').update({ status: 'approved' }).eq('id', dep.id);
    // Update user profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', dep.user_id).single();
    if (prof) {
      await supabase.from('profiles').update({
        deposit_amount: (prof.deposit_amount || 0) + dep.amount,
        deposit_approved: true,
      }).eq('user_id', dep.user_id);

      // Check if this user was referred and update referral
      if (prof.referred_by) {
        const { data: referrer } = await supabase.from('profiles').select('user_id').eq('referral_code', prof.referred_by).single();
        if (referrer) {
          await supabase.from('referrals').update({ deposit_completed: true }).eq('referred_user_id', dep.user_id);
          // Check if referrer now has 2 completed referral deposits
          const { data: refs } = await supabase.from('referrals').select('*').eq('referrer_id', referrer.user_id).eq('deposit_completed', true);
          if (refs && refs.length >= 2) {
            await supabase.from('profiles').update({ withdrawal_unlocked: true }).eq('user_id', referrer.user_id);
          }
        }
      }
    }
    toast.success('Deposit approved');
    fetchAll();
  };

  const rejectDeposit = async (id: string) => {
    await supabase.from('deposits').update({ status: 'rejected' }).eq('id', id);
    toast.success('Deposit rejected');
    fetchAll();
  };

  const approveWithdrawal = async (id: string) => {
    await supabase.from('withdrawals').update({ status: 'approved' }).eq('id', id);
    toast.success('Withdrawal approved');
    fetchAll();
  };

  const rejectWithdrawal = async (id: string) => {
    await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', id);
    toast.success('Withdrawal rejected');
    fetchAll();
  };

  const updateUserBalance = async () => {
    if (!editingUser) return;
    await supabase.from('profiles').update({
      deposit_amount: editValues.deposit_amount,
      total_earnings: editValues.total_earnings,
      available_balance: editValues.available_balance,
    }).eq('user_id', editingUser.user_id);
    toast.success('User updated');
    setEditingUser(null);
    fetchAll();
  };

  const addManualHistory = async () => {
    if (!manualUserId || !manualAmount) { toast.error('Fill all fields'); return; }
    if (manualType === 'deposit') {
      await supabase.from('deposits').insert({
        user_id: manualUserId,
        amount: Number(manualAmount),
        status: 'approved',
        is_manual: true,
      });
    } else {
      await supabase.from('withdrawals').insert({
        user_id: manualUserId,
        amount: Number(manualAmount),
        upi_id: manualUpi || 'manual',
        status: 'approved',
        is_manual: true,
      });
    }
    toast.success(`Manual ${manualType} history added (balance NOT changed)`);
    setManualUserId('');
    setManualAmount('');
    setManualUpi('');
    fetchAll();
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><p className="text-foreground">Access Denied</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Panel</h1>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
            <TabsTrigger value="manual">Add History</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Ref: {u.referral_code} | Tasks: {u.tasks_completed}/5</p>
                    <p className="text-xs text-muted-foreground">Deposit: ₹{u.deposit_amount} | Earned: ₹{u.total_earnings} | Balance: ₹{u.available_balance}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingUser(u);
                    setEditValues({ deposit_amount: u.deposit_amount || 0, total_earnings: u.total_earnings || 0, available_balance: u.available_balance || 0 });
                  }}>Edit</Button>
                </div>
              ))}
            </div>

            {editingUser && (
              <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
                <div className="glass-card p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-foreground mb-4">Edit: {editingUser.email}</h3>
                  <div className="space-y-3">
                    <div><Label>Deposit Amount</Label><Input type="number" value={editValues.deposit_amount} onChange={e => setEditValues({ ...editValues, deposit_amount: Number(e.target.value) })} /></div>
                    <div><Label>Total Earnings</Label><Input type="number" value={editValues.total_earnings} onChange={e => setEditValues({ ...editValues, total_earnings: Number(e.target.value) })} /></div>
                    <div><Label>Available Balance</Label><Input type="number" value={editValues.available_balance} onChange={e => setEditValues({ ...editValues, available_balance: Number(e.target.value) })} /></div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button className="gradient-primary text-primary-foreground" onClick={updateUserBalance}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="deposits">
            <div className="space-y-3">
              {deposits.map(d => (
                <div key={d.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground">User: {d.user_id.slice(0, 8)}... | ₹{d.amount}</p>
                    <p className="text-xs text-muted-foreground">Status: <span className={d.status === 'approved' ? 'text-primary' : d.status === 'rejected' ? 'text-destructive' : 'text-accent'}>{d.status}</span>
                      {d.is_manual && ' (manual)'}
                    </p>
                    {d.screenshot_url && (
                      <a href={d.screenshot_url} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3" /> View Screenshot
                      </a>
                    )}
                  </div>
                  {d.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => approveDeposit(d)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectDeposit(d.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals">
            <div className="space-y-3">
              {withdrawals.map(w => (
                <div key={w.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground">User: {w.user_id.slice(0, 8)}... | ₹{w.amount} | UPI: {w.upi_id}</p>
                    <p className="text-xs text-muted-foreground">Status: <span className={w.status === 'approved' ? 'text-primary' : w.status === 'rejected' ? 'text-destructive' : 'text-accent'}>{w.status}</span>
                      {w.is_manual && ' (manual)'}
                    </p>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => approveWithdrawal(w.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectWithdrawal(w.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="glass-card p-8 max-w-md">
              <h3 className="font-bold text-foreground mb-4">Add Manual History</h3>
              <p className="text-sm text-muted-foreground mb-4">This adds a record only. User balance will NOT change.</p>
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <select className="w-full border rounded-lg p-2 bg-card text-foreground mt-1" value={manualType} onChange={e => setManualType(e.target.value as any)}>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>
                <div><Label>User ID</Label><Input value={manualUserId} onChange={e => setManualUserId(e.target.value)} placeholder="User UUID" /></div>
                <div><Label>Amount</Label><Input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)} /></div>
                {manualType === 'withdrawal' && (
                  <div><Label>UPI ID</Label><Input value={manualUpi} onChange={e => setManualUpi(e.target.value)} placeholder="upi@id" /></div>
                )}
                <Button className="gradient-primary text-primary-foreground" onClick={addManualHistory}>Add Record</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
