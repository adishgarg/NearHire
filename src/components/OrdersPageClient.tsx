'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, CheckCircle2, XCircle, AlertCircle, Download, MessageSquare, Package, Upload } from 'lucide-react';
import { Progress } from './ui/progress';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface OrderData {
  id: string;
  gigId: string;
  status: string;
  price: string;
  platformFee: string;
  requirements: string | null;
  deliverables: string[];
  dueDate: string;
  deliveredAt: string | null;
  completedAt: string | null;
  progress: number;
  revisions: number;
  maxRevisions: number;
  createdAt: string;
  updatedAt: string;
  gig: {
    id: string;
    title: string;
    images: string[];
    deliveryTime: number;
  };
  seller?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    rating: number;
  };
  buyer?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  conversation: {
    id: string;
  } | null;
}

interface OrdersPageClientProps {
  buyerOrders: OrderData[];
  sellerOrders: OrderData[];
}

export function OrdersPageClient({ buyerOrders, sellerOrders }: OrdersPageClientProps) {
  const router = useRouter();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleCompleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to mark this order as completed? This action cannot be undone.')) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (response.ok) {
        toast.success('Order marked as completed!');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to complete order');
      }
    } catch (error) {
      toast.error('Failed to complete order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      });

      if (response.ok) {
        toast.success('Order marked as delivered!');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to mark as delivered');
      }
    } catch (error) {
      toast.error('Failed to mark as delivered');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStartWork = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      if (response.ok) {
        toast.success('Order started! You can now work on it.');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start order');
      }
    } catch (error) {
      toast.error('Failed to start order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string, icon: any, label: string }> = {
      PENDING: { className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
      IN_PROGRESS: { className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'In Progress' },
      DELIVERED: { className: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package, label: 'Delivered' },
      COMPLETED: { className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Completed' },
      CANCELLED: { className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
      DISPUTED: { className: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, label: 'Disputed' },
      REFUNDED: { className: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, label: 'Refunded' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`gap-1 ${config.className} border rounded-full px-3 py-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const renderOrderCard = (order: OrderData, isSelling: boolean) => {
    const otherUser = isSelling ? order.buyer : order.seller;
    const imageUrl = order.gig.images[0] || '/placeholder.png';
    
    return (
      <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-gray-200 rounded-2xl">
        <div className="md:flex">
          {/* Gig Image */}
          <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0 bg-gray-100">
            <img
              src={imageUrl}
              alt={order.gig.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Order Details */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-gray-900">
                  {order.gig.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Avatar className="w-6 h-6 border border-gray-200">
                    <AvatarImage src={otherUser?.image || undefined} />
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      {otherUser?.name?.[0] || otherUser?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {isSelling ? 'Buyer' : 'Seller'}: {otherUser?.name || otherUser?.username || 'Unknown'}
                  </span>
                  {!isSelling && order.seller && (
                    <span className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      {order.seller.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Progress Bar (for IN_PROGRESS orders) */}
            {order.status === 'IN_PROGRESS' && (
              <div className="mb-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-semibold text-blue-600">{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2 bg-gray-200" />
              </div>
            )}

            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Price</p>
                <p className="font-semibold text-gray-900">₹{Number(order.price).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Order Date</p>
                <p className="font-medium text-gray-900 text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Due Date</p>
                <p className="font-medium text-gray-900 text-sm">{formatDate(order.dueDate)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Delivery Time</p>
                <p className="font-medium text-gray-900 text-sm">{order.gig.deliveryTime} days</p>
              </div>
            </div>

            {/* Deliverables */}
            {order.deliverables.length > 0 && (
              <div className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200 shadow-sm">
                <p className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Deliverables
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.deliverables.map((file, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 rounded-full shadow-sm"
                      onClick={() => window.open(file, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                      File {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="default"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                View Details
              </Button>
              {order.conversation && (
                <Button
                  variant="outline"
                  className="gap-2 border-gray-300 hover:bg-gray-50 rounded-full"
                  onClick={() => router.push(`/messages?conversationId=${order.conversation?.id}`)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              )}
              {order.status === 'PENDING' && isSelling && (
                <Button
                  variant="default"
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full"
                  onClick={() => handleStartWork(order.id)}
                  disabled={updatingOrderId === order.id}
                >
                  <Clock className="w-4 h-4" />
                  {updatingOrderId === order.id ? 'Processing...' : 'Start Work'}
                </Button>
              )}
              {order.status === 'DELIVERED' && !isSelling && (
                <Button
                  variant="default"
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
                  onClick={() => handleCompleteOrder(order.id)}
                  disabled={updatingOrderId === order.id}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {updatingOrderId === order.id ? 'Processing...' : 'Accept & Complete'}
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && isSelling && (
                <Button
                  variant="default"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  onClick={() => handleMarkDelivered(order.id)}
                  disabled={updatingOrderId === order.id}
                >
                  <Upload className="w-4 h-4" />
                  {updatingOrderId === order.id ? 'Processing...' : 'Mark as Delivered'}
                </Button>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <p>Order ID: {order.id.substring(0, 12)}...</p>
              <p>Updated: {formatTimeAgo(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderEmptyState = (isSelling: boolean) => (
    <div className="text-center py-16 bg-gray-50 rounded-2xl">
      <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-12 h-12 text-amber-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">No orders yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {isSelling 
          ? "You haven't received any orders yet. Keep promoting your services!"
          : "You haven't placed any orders yet. Browse the marketplace to get started."}
      </p>
      <Button 
        onClick={() => router.push(isSelling ? '/dashboard/my-gigs' : '/marketplace')}
        className="bg-gray-900 hover:bg-gray-800 text-white rounded-full"
      >
        {isSelling ? 'Manage Gigs' : 'Browse Marketplace'}
      </Button>
    </div>
  );

  const filterOrders = (orders: OrderData[], filter: string) => {
    if (filter === 'all') return orders;
    if (filter === 'active') return orders.filter(o => ['PENDING', 'IN_PROGRESS', 'DELIVERED'].includes(o.status));
    if (filter === 'completed') return orders.filter(o => o.status === 'COMPLETED');
    if (filter === 'cancelled') return orders.filter(o => ['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(o.status));
    return orders;
  };

  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 text-gray-900">My Orders</h1>
          <p className="text-gray-600">Manage your orders and track their progress</p>
        </div>

        <Tabs defaultValue="buying" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white border border-gray-200 p-1 rounded-full">
            <TabsTrigger value="buying" className="gap-2 rounded-full text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              Buying ({buyerOrders.length})
            </TabsTrigger>
            <TabsTrigger value="selling" className="gap-2 rounded-full text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              Selling ({sellerOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Buying Orders Tab */}
          <TabsContent value="buying" className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-gray-100 border border-gray-200 rounded-full p-1 w-full">
                  <TabsTrigger value="all" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    All ({buyerOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Active ({filterOrders(buyerOrders, 'active').length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Completed ({filterOrders(buyerOrders, 'completed').length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Cancelled ({filterOrders(buyerOrders, 'cancelled').length})
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {buyerOrders.length > 0 
                ? buyerOrders.map(order => renderOrderCard(order, false))
                : renderEmptyState(false)
              }
            </TabsContent>

            <TabsContent value="active" className="space-y-4 mt-6">
              {filterOrders(buyerOrders, 'active').length > 0
                ? filterOrders(buyerOrders, 'active').map(order => renderOrderCard(order, false))
                : renderEmptyState(false)
              }
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {filterOrders(buyerOrders, 'completed').length > 0
                ? filterOrders(buyerOrders, 'completed').map(order => renderOrderCard(order, false))
                : renderEmptyState(false)
              }
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {filterOrders(buyerOrders, 'cancelled').length > 0
                ? filterOrders(buyerOrders, 'cancelled').map(order => renderOrderCard(order, false))
                : renderEmptyState(false)
              }
            </TabsContent>
          </Tabs>
            </div>
          </TabsContent>

          {/* Selling Orders Tab */}
          <TabsContent value="selling" className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-gray-100 border border-gray-200 rounded-full p-1 w-full">
                  <TabsTrigger value="all" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    All ({sellerOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Active ({filterOrders(sellerOrders, 'active').length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Completed ({filterOrders(sellerOrders, 'completed').length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="rounded-full text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1">
                    Cancelled ({filterOrders(sellerOrders, 'cancelled').length})
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {sellerOrders.length > 0 
                ? sellerOrders.map(order => renderOrderCard(order, true))
                : renderEmptyState(true)
              }
            </TabsContent>

            <TabsContent value="active" className="space-y-4 mt-6">
              {filterOrders(sellerOrders, 'active').length > 0
                ? filterOrders(sellerOrders, 'active').map(order => renderOrderCard(order, true))
                : renderEmptyState(true)
              }
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {filterOrders(sellerOrders, 'completed').length > 0
                ? filterOrders(sellerOrders, 'completed').map(order => renderOrderCard(order, true))
                : renderEmptyState(true)
              }
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {filterOrders(sellerOrders, 'cancelled').length > 0
                ? filterOrders(sellerOrders, 'cancelled').map(order => renderOrderCard(order, true))
                : renderEmptyState(true)
              }
            </TabsContent>
          </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
