'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, CheckCircle2, XCircle, AlertCircle, Download, MessageSquare, Package } from 'lucide-react';
import { Progress } from './ui/progress';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any, label: string }> = {
      PENDING: { variant: 'secondary', icon: Clock, label: 'Pending' },
      IN_PROGRESS: { variant: 'default', icon: Clock, label: 'In Progress' },
      DELIVERED: { variant: 'outline', icon: Package, label: 'Delivered' },
      COMPLETED: { variant: 'default', icon: CheckCircle2, label: 'Completed' },
      CANCELLED: { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
      DISPUTED: { variant: 'destructive', icon: AlertCircle, label: 'Disputed' },
      REFUNDED: { variant: 'secondary', icon: XCircle, label: 'Refunded' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
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
      <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="md:flex">
          {/* Gig Image */}
          <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0">
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
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                  {order.gig.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={otherUser?.image || undefined} />
                    <AvatarFallback>
                      {otherUser?.name?.[0] || otherUser?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {isSelling ? 'Buyer' : 'Seller'}: {otherUser?.name || otherUser?.username || 'Unknown'}
                  </span>
                  {!isSelling && order.seller && (
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {order.seller.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Progress Bar (for IN_PROGRESS orders) */}
            {order.status === 'IN_PROGRESS' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2" />
              </div>
            )}

            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Price</p>
                <p className="font-semibold">${Number(order.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium">{formatDate(order.dueDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Delivery Time</p>
                <p className="font-medium">{order.gig.deliveryTime} days</p>
              </div>
            </div>

            {/* Deliverables */}
            {order.deliverables.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Deliverables:</p>
                <div className="flex flex-wrap gap-2">
                  {order.deliverables.map((file, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="gap-2"
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
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                View Details
              </Button>
              {order.conversation && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push(`/messages?conversationId=${order.conversation?.id}`)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              )}
              {order.status === 'DELIVERED' && !isSelling && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order.id}?action=review`)}
                >
                  Accept & Review
                </Button>
              )}
              {order.status === 'IN_PROGRESS' && isSelling && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order.id}?action=deliver`)}
                >
                  Deliver Order
                </Button>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              <p>Order ID: {order.id}</p>
              <p>Last updated: {formatTimeAgo(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderEmptyState = (isSelling: boolean) => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
      <p className="text-gray-600 mb-6">
        {isSelling 
          ? "You haven't received any orders yet. Keep promoting your services!"
          : "You haven't placed any orders yet. Browse the marketplace to get started."}
      </p>
      <Button onClick={() => router.push('/marketplace')}>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Manage your orders and track their progress</p>
      </div>

      <Tabs defaultValue="buying" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="buying" className="gap-2">
            <Package className="w-4 h-4" />
            Buying ({buyerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="selling" className="gap-2">
            <Package className="w-4 h-4" />
            Selling ({sellerOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Buying Orders Tab */}
        <TabsContent value="buying" className="space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({buyerOrders.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({filterOrders(buyerOrders, 'active').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterOrders(buyerOrders, 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
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
        </TabsContent>

        {/* Selling Orders Tab */}
        <TabsContent value="selling" className="space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({sellerOrders.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({filterOrders(sellerOrders, 'active').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterOrders(sellerOrders, 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
