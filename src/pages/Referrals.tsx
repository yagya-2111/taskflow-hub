import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Referrals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    setProfile(p);
    const { data: refs } = await supabase.from('referrals').select('*').eq('referrer_id', user!.id);
    setReferrals(refs || []);
    setLoading(false);
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const link = `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Referral Program</h1>

        <div className="glass-card p-8 mb-6 text-center animate-fade-in-up">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Share & Unlock Withdrawal</h2>
          <p className="text-muted-foreground mb-6">Refer 2 friends who deposit ₹1000 each to unlock your withdrawals</p>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <Input readOnly value={link} className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(link); toast.success('Copied!'); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-foreground mb-4">Your Referrals ({referrals.length})</h3>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No referrals yet. Share your link!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-foreground">User #{ref.referred_user_id.slice(0, 8)}</span>
                  {ref.deposit_completed ? (
                    <span className="flex items-center gap-1 text-primary text-sm"><CheckCircle className="w-4 h-4" /> Deposited</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground text-sm"><Clock className="w-4 h-4" /> Pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
