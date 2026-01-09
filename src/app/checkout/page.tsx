'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Shield, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  images: string[];
  seller: {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    responseTime?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const gigId = searchParams.get('gigId');

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/checkout?gigId=${gigId}`);
      return;
    }

    if (!gigId) {
      router.push('/marketplace');
      return;
    }

    const fetchGig = async () => {
      try {
        const response = await fetch(`/api/gigs/${gigId}`);
        if (response.ok) {
          const data = await response.json();
          setGig(data);
        } else {
          setError('Gig not found');
        }
      } catch (error) {
        console.error('Error fetching gig:', error);
        setError('Failed to load gig details');
      } finally {
        setLoading(false);
      }
    };

    if (gigId && status === 'authenticated') {
      fetchGig();
    }
  }, [gigId, router, status]);

  const handlePlaceOrder = async () => {
    if (!gig || !razorpayLoaded) return;

    if (!requirements.trim()) {
      setError('Please provide order requirements');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const price = Number(gig.price);
      const platformFee = price * 0.10;
      const totalAmount = price + platformFee;

      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gigId: gig.id,
          amount: totalAmount,
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NearHire',
        description: gig.title,
        image: '/logo.png',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment and create order
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                gigId: gig.id,
                requirements: requirements.trim(),
                amount: totalAmount,
                platformFee: platformFee,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              router.push(`/orders/confirmation/${verifyData.order.id}`);
            } else {
              setError(verifyData.error || 'Payment verification failed');
              setSubmitting(false);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support.');
            setSubmitting(false);
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#111827',
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initiate payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <Link href="/marketplace">
            <Button variant="outline" className="border-gray-300 hover:bg-white">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(gig.price);
  const platformFee = price * 0.10;
  const totalAmount = price + platformFee;

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setError('Failed to load payment gateway')}
      />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/gigs/${gigId}`}>
            <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gig
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Summary */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Gig Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {gig.images[0] && (
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image
                        src={gig.images[0]}
                        alt={gig.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-2">{gig.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{gig.deliveryTime} day delivery</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>by {gig.seller.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Order Requirements</CardTitle>
                <CardDescription>
                  Provide details about what you need. Be as specific as possible to help the seller understand your requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    What do you need? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="Please describe your requirements in detail. Include any specific instructions, preferences, or files that the seller should be aware of..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={6}
                    className="resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    {requirements.length}/1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust & Safety */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Secure Payment</h4>
                      <p className="text-sm text-gray-600">
                        Your payment is held securely until the order is completed
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Quality Guarantee</h4>
                      <p className="text-sm text-gray-600">
                        Get a refund if the work doesn't meet your requirements
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Milestone Payments</h4>
                      <p className="text-sm text-gray-600">
                        Release payment only when you're satisfied with the delivery
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Price</span>
                      <span className="font-medium">₹{price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee (10%)</span>
                      <span className="font-medium">₹{platformFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Delivery Time</span>
                      <span className="font-medium text-gray-900">{gig.deliveryTime} days</span>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6"
                    onClick={handlePlaceOrder}
                    disabled={submitting || !requirements.trim() || !razorpayLoaded}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Payment...
                      </span>
                    ) : !razorpayLoaded ? (
                      'Loading Payment Gateway...'
                    ) : (
                      `Pay ₹${totalAmount.toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    By placing this order, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-gray-900">
                      Terms of Service
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
