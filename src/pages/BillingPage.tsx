import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useFlutterwave } from 'flutterwave-react-v3';
import { FlutterWaveTypes } from 'flutterwave-react-v3';
type FlutterWaveResponse = FlutterWaveTypes.FlutterWaveResponse;
import { Zap, Check, CreditCard, Clock, Loader2, Mic, Headphones, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { animate, stagger } from 'animejs';
import { useAuthStore, useUIStore, useCreditStore } from '@/store';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import {
  creditPacks,
  generateTransactionRef,
  getFlutterwavePublicKey,
  formatPrice,
  type CreditPack,
} from '@/lib/flutterwave';
import { Waveform } from '@/components/animations/Waveform';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  credits: number;
  type: string;
  description: string;
}

export default function BillingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { user: authUser } = useAuthStore();
  const { credits } = useCredits();
  const { addCredits } = useCreditStore();
  const { showToast } = useUIStore();
  
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const balanceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const publicKey = getFlutterwavePublicKey();
  const currentUser = user || authUser;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        const formattedTransactions: Transaction[] = (data || []).map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          date: new Date(tx.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: tx.status as 'completed' | 'pending' | 'failed',
          credits: tx.credits,
          type: tx.type,
          description: tx.description || '',
        }));

        setTransactions(formattedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);
  
  const handleFlutterwavePayment = useFlutterwave({
    public_key: publicKey || '',
    tx_ref: generateTransactionRef(),
    amount: selectedPack?.price || 0,
    currency: 'NGN',
    customer: {
      email: currentUser?.email || '',
      phone_number: '',
      name: currentUser?.user_metadata?.full_name || currentUser?.email || 'User',
    },
    customizations: {
      title: 'PodCraft',
      description: selectedPack ? `${selectedPack.name} - ${selectedPack.credits} Credits` : 'Podcast Credits',
      logo: 'https://your-logo-url.com/logo.png',
    },
    payment_options: 'card,bank_transfer,ussd,mobile_money',
  });

  useEffect(() => {
    if (balanceRef.current) {
      const counter = { value: 0 };
      animate(counter, {
        value: credits,
        duration: 1000,
        ease: 'outQuad',
        update: () => {
          if (balanceRef.current) {
            balanceRef.current.textContent = Math.round(counter.value).toString();
          }
        },
      });
    }
  }, [credits]);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = Array.from(cardsRef.current.children);
      animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: stagger(80),
        ease: 'outQuad',
      });
    }
  }, []);

  const handlePurchase = (pack: CreditPack) => {
    if (!currentUser) {
      showToast('Please log in to purchase credits', 'error');
      navigate('/login');
      return;
    }

    if (!publicKey) {
      showToast('Payment not configured. Please add your Flutterwave public key.', 'error');
      return;
    }

    setSelectedPack(pack);
  };

  useEffect(() => {
    if (selectedPack) {
      handleFlutterwavePayment({
        callback: (response: FlutterWaveResponse) => {
          console.log('Payment response:', response);
          if (response.status === 'successful') {
            addCredits(selectedPack.credits);
            setPurchasedCredits(selectedPack.credits);
            setShowSuccess(true);
            showToast(`${selectedPack.credits} credits added successfully!`, 'success');
            
            setTimeout(() => {
              setShowSuccess(false);
              setSelectedPack(null);
            }, 3000);
          } else {
            showToast('Payment failed. Please try again.', 'error');
            setSelectedPack(null);
          }
        },
        onClose: () => {
          console.log('Payment modal closed');
          showToast('Payment cancelled', 'info');
          setSelectedPack(null);
        },
      });
    }
  }, [selectedPack]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/speakers', label: 'Speakers', icon: Mic },
    { href: '/dashboard/podcasts', label: 'Podcasts', icon: Headphones },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-display">PodCraft</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {currentUser?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">
          {/* Credit Balance */}
          <Card className="mb-8 border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Zap className="w-5 h-5 text-primary" />
                Your Credits
              </CardTitle>
              <CardDescription>
                Credits are used to generate podcast episodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span
                  ref={balanceRef}
                  className="text-5xl font-bold text-primary font-mono"
                >
                  0
                </span>
                <span className="text-xl text-muted-foreground">
                  credits remaining
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(credits / 200) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {credits} of 200 monthly credits used
              </p>
            </CardContent>
          </Card>

          {/* Purchase Credits */}
          <h2 className="text-2xl font-bold mb-6 font-display">Purchase Credits</h2>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {creditPacks.map((pack) => (
              <Card
                key={pack.id}
                className={`relative border-border/50 bg-card/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  pack.popular ? 'border-secondary/50' : ''
                } ${selectedPack?.id === pack.id ? 'scale-[1.02]' : ''}`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-display">{pack.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold font-mono">{formatPrice(pack.price)}</span>
                  </div>
                  <CardDescription>
                    {pack.credits} credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span>{pack.credits} podcast credits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span>No expiration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    variant={pack.popular ? 'default' : 'outline'}
                    style={
                      pack.popular
                        ? { backgroundColor: pack.color, color: '#0B0F19' }
                        : { borderColor: pack.color, color: pack.color }
                    }
                    onClick={() => handlePurchase(pack)}
                    disabled={selectedPack !== null}
                  >
                    {selectedPack?.id === pack.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-2xl text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display">Purchase Successful!</h3>
                <p className="text-muted-foreground">
                  {purchasedCredits} credits have been added to your account.
                </p>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 font-display">
              <Clock className="w-6 h-6 text-muted-foreground" />
              Recent Transactions
            </h2>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-0">
                {loadingTransactions ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Purchase credits to see your history here</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium font-mono">
                            {tx.credits} credits
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.date} · {tx.type === 'purchase' ? formatPrice(tx.amount) : tx.type}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === 'completed' 
                          ? 'bg-success/10 text-success' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Waveform accent */}
          <div className="flex justify-center mt-12 opacity-30">
            <Waveform barCount={60} height={24} color="var(--primary)" animated={false} />
          </div>
        </div>
      </main>
    </div>
  );
}
