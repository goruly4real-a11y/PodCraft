/**
 * ============================================================================
 * BILLING PAGE
 * ============================================================================
 * 
 * Credit management and payment processing page using Flutterwave.
 * Features:
 * - 3D tilt card effects on hover
 * - Animated credit counter with anime.js
 * - Sparkle effect on buy buttons
 * - Real Flutterwave payment integration
 * - Transaction history display
 * 
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlutterwave } from 'flutterwave-react-v3';
import type { FlutterWaveResponse } from 'flutterwave-react-v3';
import { ArrowLeft, Zap, Check, CreditCard, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SparkleEffect } from '@/components/animations/SparkleEffect';
import { FadeIn, StaggerList } from '@/components/animations/PageTransitions';
import { animate, stagger } from 'animejs';
import { useAuthStore, useUIStore } from '@/store';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/lib/supabase/client';
import {
  creditPacks,
  generateTransactionRef,
  getFlutterwavePublicKey,
  formatPrice,
  type CreditPack,
} from '@/lib/flutterwave';

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
  const { user } = useAuthStore();
  const { credits, addCredits } = useCredits();
  const { showToast } = useUIStore();
  
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const balanceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const publicKey = getFlutterwavePublicKey();

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
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
  }, [user]);
  
  const handleFlutterwavePayment = useFlutterwave({
    public_key: publicKey || '',
    tx_ref: generateTransactionRef(),
    amount: selectedPack?.price || 0,
    currency: 'NGN',
    customer: {
      email: user?.email || '',
      phone_number: '',
      name: user?.user_metadata?.full_name || user?.email || 'User',
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
        translateY: [30, 0],
        scale: [0.95, 1],
        duration: 600,
        delay: stagger(100),
        ease: 'outQuad',
      });
    }
  }, []);

  const handlePurchase = (pack: CreditPack) => {
    if (!user) {
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Billing</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <FadeIn>
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  className="text-5xl font-bold text-primary"
                >
                  0
                </span>
                <span className="text-xl text-muted-foreground">
                  credits remaining
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(credits / 200) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {credits} of 200 monthly credits used
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
        </FadeIn>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {creditPacks.map((pack) => (
            <Card
              key={pack.id}
              className={`relative border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                pack.popular ? 'border-secondary/50 shadow-secondary/10' : ''
              } ${selectedPack?.id === pack.id ? 'scale-[1.02]' : ''}`}
              style={{
                transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.02)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
              }}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pack.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{formatPrice(pack.price)}</span>
                </div>
                <CardDescription>
                  {pack.credits} credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>{pack.credits} podcast credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>No expiration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <SparkleEffect className="w-full">
                  <Button
                    className="w-full"
                    variant={pack.popular ? 'default' : 'outline'}
                    style={
                      pack.popular
                        ? { backgroundColor: pack.color, color: '#0F172A' }
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
                </SparkleEffect>
              </CardContent>
            </Card>
          ))}
        </div>

        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-2xl text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Purchase Successful!</h3>
              <p className="text-muted-foreground">
                {purchasedCredits} credits have been added to your account.
              </p>
            </div>
          </div>
        )}

        <FadeIn delay={400}>
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-muted-foreground" />
              Recent Transactions
            </h2>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
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
                  <StaggerList>
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.credits} credits
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.date} • {tx.type === 'purchase' ? formatPrice(tx.amount) : tx.type}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.status === 'completed' 
                            ? 'bg-secondary/10 text-secondary' 
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}