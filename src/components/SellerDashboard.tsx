'use client'
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Eye,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GigCard } from './GigCard';
import { Gig } from '../types';
import { mockGigs } from '../data/mockData';
import { useRouter } from 'next/navigation';

interface SellerDashboardProps {
  gigs?: Gig[];
  onGigClick?: (gig: Gig) => void;
  onCreateGig?: () => void;
}

export function SellerDashboard({ gigs = mockGigs, onGigClick, onCreateGig }: SellerDashboardProps) {
  const router = useRouter();
  
  const handleGigClick = (gig: Gig) => {
    if (onGigClick) {
      onGigClick(gig);
    } else {
      router.push(`/gigs/${gig.id}`);
    }
  };
  
  const handleCreateGig = () => {
    if (onCreateGig) {
      onCreateGig();
    } else {
      router.push('/gigs/create');
    }
  };
  const stats = [
    {
      title: 'Total Earnings',
      value: '₹12,450',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10',
    },
    {
      title: 'Active Orders',
      value: '24',
      change: '+3',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Avg. Rating',
      value: '4.9',
      change: '+0.2',
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
    },
    {
      title: 'Profile Views',
      value: '1,234',
      change: '+24%',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
    },
  ];

  const recentActivity = [
    {
      type: 'order',
      message: 'New order for "Modern logo design"',
      time: '5 minutes ago',
      icon: ShoppingBag,
    },
    {
      type: 'message',
      message: 'New message from John Doe',
      time: '1 hour ago',
      icon: MessageSquare,
    },
    {
      type: 'review',
      message: 'New 5-star review received',
      time: '2 hours ago',
      icon: Star,
    },
    {
      type: 'order',
      message: 'Order completed: "Website development"',
      time: '5 hours ago',
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-gray-900 font-playfair text-3xl font-semibold">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your gigs and track your performance</p>
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full" onClick={handleCreateGig}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Gig
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-gray-200 bg-white p-6 rounded-3xl">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100`}>
                    <Icon className="h-6 w-6 text-gray-900" />
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl text-gray-900 font-semibold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gigs Management */}
            <Card className="border-gray-200 bg-white p-6 mb-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-playfair text-xl font-semibold">Your Gigs</h2>
                <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full">
                  Manage All
                </Button>
              </div>

              <Tabs defaultValue="active">
                <TabsList className="bg-white border border-gray-200 rounded-full p-1 mb-4">
                  <TabsTrigger value="active" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                    Active ({gigs.length})
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                    Drafts (2)
                  </TabsTrigger>
                  <TabsTrigger value="paused" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                    Paused (0)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gigs.slice(0, 4).map((gig) => {
                      // If seller data is missing, create mock seller
                      const gigWithSeller = gig.seller ? gig : {
                        ...gig,
                        seller: {
                          id: 'unknown',
                          name: 'Unknown Seller',
                          image: null,
                          rating: 0,
                          reviewCount: 0,
                          verified: false,
                          level: 'New Seller'
                        }
                      };
                      return <GigCard key={gig.id} gig={gigWithSeller} onClick={() => handleGigClick(gigWithSeller)} />;
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="draft">
                  <div className="text-center py-8">
                    <p className="text-gray-600">You have 2 draft gigs</p>
                    <Button className="mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                      View Drafts
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="paused">
                  <div className="text-center py-8">
                    <p className="text-gray-600">No paused gigs</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h2 className="mb-6 text-gray-900 font-playfair text-xl font-semibold">Earnings Overview</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-900 mx-auto mb-3" />
                  <p className="text-gray-600">Earnings chart would go here</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h3 className="mb-4 text-gray-900 font-playfair font-semibold text-lg">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-gray-50 text-gray-900 hover:bg-gray-100 rounded-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Messages
                </Button>
                <Button className="w-full justify-start bg-gray-50 text-gray-900 hover:bg-gray-100 rounded-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Manage Orders
                </Button>
                <Button className="w-full justify-start bg-gray-50 text-gray-900 hover:bg-gray-100 rounded-full">
                  <Star className="mr-2 h-4 w-4" />
                  View Reviews
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h3 className="mb-4 text-gray-900 font-playfair font-semibold text-lg">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tips */}
            <Card className="border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl">
              <h3 className="mb-3 text-gray-900 font-playfair font-semibold text-lg">Seller Tip</h3>
              <p className="text-sm text-gray-700 mb-4">
                Respond to messages within 1 hour to improve your response rate and attract more clients!
              </p>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-900 hover:bg-white rounded-full">
                Learn More
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
