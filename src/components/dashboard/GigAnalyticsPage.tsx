'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Eye,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GigAnalyticsPageProps {
  gig: {
    id: string;
    title: string;
    isActive: boolean;
    createdAt: Date;
    category: {
      name: string;
    };
    orders: Array<{
      id: string;
      status: string;
      price: number;
      createdAt: Date;
      completedAt: Date | null;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: Date;
      reviewer: {
        name: string | null;
        image: string | null;
      };
    }>;
  };
  analytics: {
    views: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    avgRating: number;
    reviewCount: number;
    recentOrders: number;
    conversionRate: string;
  };
}

export function GigAnalyticsPage({ gig, analytics }: GigAnalyticsPageProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#e6ddcf]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-4xl font-serif font-semibold text-gray-900">
                Gig Analytics
              </h1>
              <p className="text-xl text-gray-700 mb-2">{gig.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                  {gig.category.name}
                </Badge>
                {gig.isActive ? (
                  <Badge className="bg-emerald-600 text-white rounded-full">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-300 text-gray-600 rounded-full">
                    Paused
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/gigs/${gig.id}/edit`}>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                Edit Gig
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Views</div>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-serif font-semibold text-gray-900">
              {analytics.views.toLocaleString()}
            </div>
          </Card>

          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Orders</div>
              <ShoppingCart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-serif font-semibold text-gray-900">
              {analytics.totalOrders}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.completedOrders} completed
            </div>
          </Card>

          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-serif font-semibold text-emerald-600">
              ${analytics.totalRevenue.toLocaleString()}
            </div>
          </Card>

          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Avg Rating</div>
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-3xl font-serif font-semibold text-gray-900">
              {analytics.avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.reviewCount} reviews
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-2xl font-serif font-semibold text-gray-900">
                  {analytics.conversionRate}%
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Orders per 100 views
            </p>
          </Card>

          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Completion Rate</div>
                <div className="text-2xl font-serif font-semibold text-gray-900">
                  {analytics.totalOrders > 0 
                    ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(0)
                    : 0}%
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {analytics.completedOrders} of {analytics.totalOrders} orders completed
            </p>
          </Card>

          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Recent Activity</div>
                <div className="text-2xl font-serif font-semibold text-gray-900">
                  {analytics.recentOrders}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Orders in last 30 days
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
              Recent Orders
            </h3>
            {gig.orders.length > 0 ? (
              <div className="space-y-3">
                {gig.orders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        ${Number(order.price).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No orders yet
              </p>
            )}
          </Card>

          {/* Recent Reviews */}
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
              Recent Reviews
            </h3>
            {gig.reviews.length > 0 ? (
              <div className="space-y-4">
                {gig.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {review.reviewer.name || 'Anonymous'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {review.comment || 'No comment provided'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No reviews yet
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
