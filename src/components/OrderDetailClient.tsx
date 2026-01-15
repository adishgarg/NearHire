'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';import { FileUpload } from './FileUpload';import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  MessageSquare, 
  Package,
  Star,
  Upload,
  Calendar,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface OrderDetailProps {
  order: {
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
      description: string;
      images: string[];
      deliveryTime: number;
      features: string[];
    };
    seller: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
      rating: number;
      reviewCount: number;
      responseTime: string | null;
      level: string;
    };
    buyer: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
    conversation: {
      id: string;
      lastMessage: string | null;
      lastMessageAt: string | null;
    } | null;
    review: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
    } | null;
  };
  isSeller: boolean;
}

export function OrderDetailClient({ order, isSeller }: OrderDetailProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{url: string, publicId: string}>>([]);

  const otherUser = isSeller ? order.buyer : order.seller;

  const handleFileUpload = (files: Array<{url: string, publicId: string}>) => {
    setUploadedFiles(files);
  };

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress })
      });

      if (!response.ok) throw new Error('Failed to update progress');

      toast.success(`Order progress updated to ${newProgress}%`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverOrder = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'DELIVERED',
          deliverables: uploadedFiles.map(f => f.url),
          deliveryNote 
        })
      });

      if (!response.ok) throw new Error('Failed to deliver order');

      toast.success('Your work has been delivered to the buyer');
      router.refresh();
    } catch (error) {
      toast.error('Failed to deliver order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (!response.ok) throw new Error('Failed to accept delivery');

      toast.success('The order has been marked as completed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to accept delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/orders/${order.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating: reviewRating,
          comment: reviewComment 
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');

      toast.success('Thank you for your feedback!');
      router.refresh();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/orders')}
          className="mb-4"
        >
          ← Back to Orders
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order ID: {order.id}</p>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Information */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img 
                  src={order.gig.images[0] || '/placeholder.png'}
                  alt={order.gig.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{order.gig.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{order.gig.description}</p>
                  {order.gig.features.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2 text-gray-900">Included:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {order.gig.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {order.requirements && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Order Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{order.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {order.status === 'IN_PROGRESS' && isSeller && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Update Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-900">Current Progress</span>
                      <span className="font-medium text-gray-900">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map(value => (
                      <Button
                        key={value}
                        variant={order.progress === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateProgress(value)}
                        disabled={isSubmitting}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Section */}
          {order.status === 'IN_PROGRESS' && isSeller && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Upload className="w-5 h-5" />
                  Deliver Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white p-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Delivery Note</label>
                  <Textarea
                    placeholder="Add a message to the buyer..."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    rows={4}
                    className="bg-gray-50 border-gray-300 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Upload Deliverables</label>
                  <FileUpload
                    onUpload={handleFileUpload}
                    maxFiles={10}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                    folder="deliverables"
                    existingFiles={uploadedFiles}
                  />
                </div>
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                  onClick={handleDeliverOrder}
                  disabled={isSubmitting || uploadedFiles.length === 0}
                >
                  {isSubmitting ? 'Delivering...' : 'Deliver Order'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {order.deliverables.length > 0 && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.deliverables.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Deliverable {idx + 1}</p>
                          <p className="text-sm text-gray-600">Uploaded {order.deliveredAt ? formatDistanceToNow(new Date(order.deliveredAt), { addSuffix: true }) : 'recently'}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-amber-50 border-amber-300"
                        onClick={() => window.open(file, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>

                {order.status === 'DELIVERED' && !isSeller && (
                  <div className="mt-4 pt-4">
                    <Button 
                      className="w-full"
                      onClick={handleAcceptDelivery}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept Delivery
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Section */}
          {order.status === 'COMPLETED' && !order.review && !isSeller && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        onClick={() => setReviewRating(value)}
                        className={`p-2 transition-colors ${
                          value <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Your Review</label>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !reviewComment}
                >
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Existing Review */}
          {order.review && (
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(value => (
                    <Star
                      key={value}
                      className={`w-5 h-5 ${
                        value <= order.review!.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {order.review.comment && (
                  <p className="text-gray-700">{order.review.comment}</p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Posted {formatDistanceToNow(new Date(order.review.createdAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service Price</span>
                <span className="font-semibold text-gray-900">${Number(order.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-semibold text-gray-900">${Number(order.platformFee).toFixed(2)}</span>
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900\">
                    ${(Number(order.price) + Number(order.platformFee)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Order Placed</p>
                <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(order.dueDate)}</p>
              </div>
              {order.deliveredAt && (
                <div>
                  <p className="text-gray-600">Delivered</p>
                  <p className="font-medium text-gray-900">{formatDate(order.deliveredAt)}</p>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-medium text-gray-900">{formatDate(order.completedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Revisions</p>
                <p className="font-medium">{order.revisions} / {order.maxRevisions}</p>
              </div>
            </CardContent>
          </Card>

          {/* Other User Info */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {isSeller ? 'Buyer' : 'Seller'} Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser.image || undefined} />
                  <AvatarFallback>
                    {otherUser.name?.[0] || otherUser.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{otherUser.name || otherUser.username || 'Unknown'}</p>
                  {!isSeller && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-900">{order.seller.rating.toFixed(1)}</span>
                      <span className="text-gray-600">({order.seller.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {order.conversation && (
                <Button 
                  className="w-full gap-2"
                  onClick={() => router.push(`/messages?conversationId=${order.conversation?.id}`)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
