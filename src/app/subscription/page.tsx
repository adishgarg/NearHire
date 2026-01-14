'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Clock } from 'lucide-react';
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
    name: 'SELLER',
    price: 499,
    displayPrice: '₹499',
    features: [
      'Unlimited gigs creation',
      'Seller dashboard',
      'Email & priority support',
      'Featured gig placement',
      'Advanced analytics',
      'Monthly renewal',
      'Cancel anytime'
    ]
  }
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

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

  const handleSubscribe = async (plan: string) => {
    setProcessingPlan(plan);
    setError('');

    try {
      // Create order
      const orderResponse = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay payment
      if (!window.Razorpay || !razorpayLoaded) {
        throw new Error('Payment system is still loading. Please try again in a moment.');
      }

      const options = {
        key: orderData.key,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NearHire Subscription',
        description: `${plan} Plan - Monthly Subscription`,
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
          contact: orderData.userPhone
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: orderData.amount
              })
            });

            if (verifyResponse.ok) {
              // Fetch updated subscription
              const updatedResponse = await fetch('/api/subscription');
              const updatedData = await updatedResponse.json();
              setSubscription(updatedData);
              
              // Show success message and redirect
              alert('Subscription activated successfully!');
              setTimeout(() => {
                router.push('/dashboard');
              }, 2000);
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
          ondismiss: () => {
            setProcessingPlan(null);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
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
    <div className="min-h-screen bg-gradient-to-b from-[#f5ecdf] via-white to-[#faf8f3] text-gray-900">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
      />
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="container mx-auto py-16 px-4 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200">
            <span className="text-sm font-semibold text-blue-700">💎 Premium Seller Tools</span>
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
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
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-1 shadow-2xl">
                <Card className="border-0 bg-gradient-to-br from-white to-green-50 rounded-3xl">
                  <CardContent className="pt-8 pb-8 px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-75 animate-pulse"></div>
                          <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-full">
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

        {/* Plans Grid */}
        <div className="max-w-3xl mx-auto mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative group"
            >
              {/* Gradient Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-3xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:blur-lg"></div>
              
              <Card className="relative border-0 bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Top Gradient Bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-blue-50 to-white">
                  <div className="inline-block mx-auto mb-4 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="text-xs font-bold text-blue-700">SELLER PLAN</span>
                  </div>
                  <CardTitle className="text-4xl font-black text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-8">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-6xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">{plan.displayPrice}</span>
                      <span className="text-gray-600 font-medium">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Billed monthly • Cancel anytime</p>
                  </div>
                </CardHeader>
                
                <CardContent className="px-8 py-8 space-y-8">
                  <Button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={processingPlan === plan.name || currentPlan === plan.name || !razorpayLoaded}
                    className={`w-full text-lg py-7 rounded-2xl font-bold tracking-wide transition-all duration-300 ${
                      currentPlan === plan.name
                        ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transform'
                    }`}
                  >
                    {processingPlan === plan.name ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : currentPlan === plan.name ? (
                      '✓ Current Plan'
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>

                  <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">What's Included</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base text-gray-700 group-hover/item:text-gray-900 transition-colors">{feature}</span>
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
          <Card className="border-0 bg-white shadow-xl rounded-3xl overflow-hidden">
            {/* Top Gradient Bar */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500"></div>
            
            <CardHeader className="bg-gradient-to-b from-orange-50 to-white pb-6">
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
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-bold text-gray-900 mb-2">Secure Payments</h4>
              <p className="text-sm text-gray-600">Industry-leading encryption protecting your data</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">Start selling immediately after subscription</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-colors">
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
