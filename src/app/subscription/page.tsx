'use client';

import { useState, useEffect, Suspense } from 'react';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Clock, Lock, Sparkles } from 'lucide-react';
import '@/types/razorpay';

interface SubscriptionData {
  isActive: boolean;
  subscription: {
    plan: string;
    status: string;
    endDate: string;
    startDate: string;
    isAutoRenew: boolean;
  } | null;
}

const PLANS = [
  {
    key: 'TIER1',
    name: 'Tier 1',
    monthly: 99,
    yearly: 999,
    displayMonthly: '₹99',
    displayYearly: '₹999',
    features: [
      '15 gigs',
      'Seller dashboard'
    ]
  },
  {
    key: 'TIER2',
    name: 'Tier 2',
    monthly: 199,
    yearly: 1999,
    displayMonthly: '₹199',
    displayYearly: '₹1999',
    features: [
      '50 gigs',
      'Seller dashboard'
    ]
  },
  {
    key: 'TIER3',
    name: 'Tier 3',
    monthly: 299,
    yearly: 2999,
    displayMonthly: '₹299',
    displayYearly: '₹2999',
    features: [
      'Unlimited gigs',
      'Seller dashboard'
    ]
  }
];

function SubscriptionContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpgrade = searchParams.get('upgrade') === 'true';
  const isRequired = searchParams.get('required') === 'true';
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // If subscription is required, show a simple prompt
  if (isRequired) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center p-4">
        <Card className="relative w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h1>
            <p className="text-gray-600 mb-6">
              To access this feature, please subscribe to a plan.
            </p>
            <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full">
              <a href="/subscription">View Subscription Plans</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/subscription');
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, router]);

  const handleSubscribe = async (planKey: string) => {
    setProcessingPlan(planKey);
    setError('');

    try {
      // Create order with selected plan and billing cycle
      const orderResponse = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, billingCycle }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await orderResponse.json();

      // Initialize Razorpay subscription checkout
      if (!window.Razorpay || !razorpayLoaded) {
        throw new Error('Payment system is still loading. Please try again in a moment.');
      }

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'NearHire Subscription',
        description: `${planKey} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        prefill: {
          name: data.userName,
          email: data.userEmail,
          contact: data.userPhone
        },
        handler: async (response: any) => {
          try {
            // Verify payment for subscription initial charge
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscriptionId: data.subscriptionId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: null,
                plan: planKey,
                billingCycle
              })
            });

            if (verifyResponse.ok) {
              const updatedResponse = await fetch('/api/subscription');
              const updatedData = await updatedResponse.json();
              setSubscription(updatedData);

              alert('Subscription activated successfully!');
              setTimeout(() => router.push('/dashboard'), 1200);
            } else {
              const errorData = await verifyResponse.json();
              setError(errorData.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Failed to verify payment');
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(null)
        }
      };

      const razorpay = new window.Razorpay(options as any);
      razorpay.open();
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      });

      if (response.ok) {
        const updatedResponse = await fetch('/api/subscription');
        const updatedData = await updatedResponse.json();
        setSubscription(updatedData);
        alert('Subscription cancelled successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Failed to cancel subscription');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const currentPlan = subscription?.subscription?.plan;
  const isSubscriptionActive = subscription?.isActive;

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="container mx-auto py-16 px-4 relative z-10">
        {/* Upgrade/Required Alert */}
        {(isUpgrade || isRequired) && (
          <div className="max-w-4xl mx-auto mb-12">
            <Alert className="border-2 border-gray-900 bg-white rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  {isUpgrade ? <Lock className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isUpgrade ? 'Upgrade to Start Selling' : 'Subscription Required'}
                  </h3>
                  <AlertDescription className="text-gray-600">
                    {isUpgrade 
                      ? 'Subscribe to a seller plan to create gigs, earn money, and build your business on NearHire.' 
                      : 'An active subscription is required to create and manage gigs. Choose a plan below to continue.'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-2 bg-white rounded-full border border-gray-200">
            <span className="text-sm font-semibold text-blue-700">💎 Premium Seller Tools</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight text-gray-900">
            Grow Your Gig Business
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Subscribe to NearHire Pro and unlock unlimited gigs, advanced analytics, and premium visibility to reach more clients.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSubscriptionActive && (
          <div className="mb-16">
            <div className="max-w-3xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md">
                <Card className="border-0 bg-white rounded-2xl">
                  <CardContent className="pt-8 pb-8 px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="relative bg-green-500 p-3 rounded-full">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            Your {currentPlan} Plan is Active
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Expires on <span className="font-semibold">{new Date(subscription.subscription!.endDate).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        className="rounded-xl font-semibold px-6 py-2 text-sm"
                      >
                        Cancel Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-3xl mx-auto rounded-2xl border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Billing Cycle Toggle */}
        <div className="max-w-3xl mx-auto mb-6 flex justify-center">
          <div className="inline-flex bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full ${billingCycle === 'monthly' ? 'bg-white text-gray-900' : 'text-gray-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full ${billingCycle === 'yearly' ? 'bg-white text-gray-900' : 'text-gray-600'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-6xl mx-auto mb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.key} className="relative group">
              <Card className="relative border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
                <CardHeader className="text-center pb-4 pt-6 bg-white">
                  <div className="inline-block mx-auto mb-3 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="text-xs font-bold text-blue-700">SELLER PLAN</span>
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900">
                        {billingCycle === 'monthly' ? `₹${plan.monthly}` : `₹${plan.yearly}`}
                      </span>
                      <span className="text-gray-600 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Billed {billingCycle === 'monthly' ? 'monthly' : 'yearly'}</p>
                  </div>
                </CardHeader>
                <CardContent className="px-6 py-6 space-y-6">
                  <Button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={processingPlan === plan.key || currentPlan === plan.key || !razorpayLoaded}
                    className={`w-full text-base py-3 rounded-xl font-semibold transition-all duration-200 ${
                      currentPlan === plan.key
                        ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {processingPlan === plan.key ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentPlan === plan.key ? (
                      '✓ Current Plan'
                    ) : (
                      'Subscribe'
                    )}
                  </Button>

                  <div className="space-y-3 pt-4 border-t-2 border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">What's Included</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 group/item">
                        <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="border border-gray-200 bg-white shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-white pb-6">
              <CardTitle className="text-3xl font-black text-gray-900">
                Frequently Asked Questions
              </CardTitle>
              <p className="text-gray-600 mt-2">Everything you need to know about your subscription</p>
            </CardHeader>
            <CardContent className="px-8 py-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3 pb-8 md:pb-0 md:border-r-2 md:border-gray-100 md:pr-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold text-sm">?</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Change Plans Anytime?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Yes! Upgrade or downgrade your plan at any time. Changes take effect in your next billing cycle.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pb-8 md:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-purple-600 font-bold text-sm">?</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">What If I Cancel?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Your gigs go offline but aren't deleted. Reactivate anytime to bring them back online instantly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pb-8 md:pb-0 md:border-r-2 md:border-gray-100 md:pr-8">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-green-600 font-bold text-sm">?</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Any Long-Term Contract?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        No contracts at all! Monthly billing with the freedom to cancel whenever you want.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-orange-600 font-bold text-sm">?</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Payment Methods?</h3>
                      <p className="text-gray-600 leading-relaxed">
                        We accept all major cards, debit cards, and UPI payments through secure Razorpay integration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-bold text-gray-900 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600">Industry-leading encryption protecting your data</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">Start selling immediately after subscription</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-400 transition-colors">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-gray-900 mb-2">Expert Support</h4>
              <p className="text-sm text-gray-600">24/7 priority support for all subscribers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple loading fallback while search params resolve
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading subscription...</p>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SubscriptionContent />
    </Suspense>
  );
}
