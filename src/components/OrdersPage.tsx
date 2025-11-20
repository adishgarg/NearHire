import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, CheckCircle2, XCircle, AlertCircle, Download, MessageSquare } from 'lucide-react';
import { Progress } from './ui/progress';

interface Order {
  id: string;
  gigTitle: string;
  gigImage: string;
  seller: {
    name: string;
    username: string;
    avatar: string;
  };
  buyer: {
    name: string;
    username: string;
    avatar: string;
  };
  price: number;
  status: 'in-progress' | 'delivered' | 'completed' | 'cancelled';
  dueDate: string;
  orderDate: string;
  progress?: number;
}

export function OrdersPage({ isSelling = false }: { isSelling?: boolean }) {
  const orders: Order[] = [
    {
      id: '1',
      gigTitle: 'Modern logo design for tech startup',
      gigImage: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400',
      seller: {
        name: 'Sarah Johnson',
        username: 'sarahdesigns',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      },
      buyer: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
      price: 150,
      status: 'in-progress',
      dueDate: 'Nov 20, 2024',
      orderDate: 'Nov 15, 2024',
      progress: 60,
    },
    {
      id: '2',
      gigTitle: 'React web application development',
      gigImage: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400',
      seller: {
        name: 'Mike Chen',
        username: 'mikecodes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      buyer: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
      price: 500,
      status: 'delivered',
      dueDate: 'Nov 18, 2024',
      orderDate: 'Nov 10, 2024',
    },
    {
      id: '3',
      gigTitle: 'Professional video editing',
      gigImage: 'https://images.unsplash.com/photo-1762762572420-535b5088f016?w=400',
      seller: {
        name: 'James Wilson',
        username: 'jamesvideo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      buyer: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      },
      price: 200,
      status: 'completed',
      dueDate: 'Nov 12, 2024',
      orderDate: 'Nov 5, 2024',
    },
  ];

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      'in-progress': {
        icon: Clock,
        text: 'In Progress',
        className: 'bg-blue-600/10 text-blue-400 border-blue-600',
      },
      'delivered': {
        icon: AlertCircle,
        text: 'Delivered',
        className: 'bg-amber-600/10 text-amber-400 border-amber-600',
      },
      'completed': {
        icon: CheckCircle2,
        text: 'Completed',
        className: 'bg-emerald-600/10 text-emerald-400 border-emerald-600',
      },
      'cancelled': {
        icon: XCircle,
        text: 'Cancelled',
        className: 'bg-red-600/10 text-red-400 border-red-600',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const filterOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const otherUser = isSelling ? order.buyer : order.seller;

    return (
      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Gig Image */}
          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-zinc-800">
            <img
              src={order.gigImage}
              alt={order.gigTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white mb-2">{order.gigTitle}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-400">
                    {isSelling ? 'Buyer' : 'Seller'}: {otherUser.name}
                  </span>
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Progress Bar */}
            {order.status === 'in-progress' && order.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-emerald-400">{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2" />
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                <p className="text-white text-sm">{order.orderDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-white text-sm">{order.dueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                <p className="text-white text-sm">#{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-white text-sm">${order.price}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact {isSelling ? 'Buyer' : 'Seller'}
              </Button>
              
              {order.status === 'delivered' && !isSelling && (
                <>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Delivery
                  </Button>
                  <Button variant="outline" size="sm" className="border-amber-600 text-amber-400 hover:bg-amber-600/10">
                    Request Revision
                  </Button>
                </>
              )}

              {order.status === 'in-progress' && isSelling && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Download className="mr-2 h-4 w-4" />
                  Deliver Work
                </Button>
              )}

              {order.status === 'completed' && (
                <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                  <Download className="mr-2 h-4 w-4" />
                  Download Files
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-white">
          {isSelling ? 'Selling Orders' : 'My Orders'}
        </h1>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-zinc-900 border-b border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              In Progress ({filterOrdersByStatus('in-progress').length})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Delivered ({filterOrdersByStatus('delivered').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Completed ({filterOrdersByStatus('completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="mt-6">
            <div className="space-y-4">
              {filterOrdersByStatus('in-progress').map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="mt-6">
            <div className="space-y-4">
              {filterOrdersByStatus('delivered').map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {filterOrdersByStatus('completed').map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
