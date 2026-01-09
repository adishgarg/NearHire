'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Calendar,
  ArrowRight,
  Download,
  Mail,
  Package
} from 'lucide-react';

interface Order {
  id: string;
  gigId: string;
  status: string;
  price: number;
  platformFee: number;
  requirements: string;
  dueDate: string;
  createdAt: string;
  gig: {
    id: string;
    title: string;
    images: string[];
    deliveryTime: number;
  };
  seller: {
    id: string;
    name: string;
    image: string | null;
    email: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          console.error('Failed to fetch order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id && status === 'authenticated') {
      fetchOrder();
    }
  }, [params.id, router, status]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button variant="outline" className="border-gray-300 hover:bg-white">
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = Number(order.price) + Number(order.platformFee);
  const dueDate = new Date(order.dueDate);

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-lg">
            Your order has been confirmed and the seller has been notified.
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="text-sm px-4 py-2 border-gray-300">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* What's Next */}
        <Card className="border-gray-200 bg-white shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Seller Reviews Your Requirements</h4>
                  <p className="text-sm text-gray-600">
                    {order.seller.name} will review your requirements and may reach out if clarification is needed.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Work Begins</h4>
                  <p className="text-sm text-gray-600">
                    The seller will start working on your order and provide updates along the way.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Delivery</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive the completed work by {dueDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border-gray-200 bg-white shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              {order.gig.images[0] && (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={order.gig.images[0]}
                    alt={order.gig.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">{order.gig.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span>Seller:</span>
                  <span className="font-medium text-gray-900">{order.seller.name}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Expected Delivery</span>
                </div>
                <span className="font-medium">
                  {dueDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Order Placed</span>
                </div>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Price</span>
                <span className="font-medium">${Number(order.price).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">${Number(order.platformFee).toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-semibold">Total Paid</span>
                <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {order.requirements && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-2">Your Requirements</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {order.requirements}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href={`/messages?userId=${order.seller.id}`} className="block">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6">
              <MessageSquare className="w-5 h-5 mr-2" />
              Message Seller
            </Button>
          </Link>
          
          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full border-gray-300 hover:bg-white rounded-full py-6">
              View All Orders
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-6 py-3">
            <Mail className="w-4 h-4" />
            <span>Order confirmation email sent to {order.buyer.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
