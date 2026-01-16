'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  ShoppingCart, 
  Star, 
  Edit, 
  Trash2, 
  MoreVertical,
  Power,
  PowerOff,
  Copy,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Gig {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  isActive: boolean;
  views: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  category: {
    name: string;
  };
  _count: {
    orders: number;
    reviews: number;
  };
  createdAt: Date;
}

interface MyGigsPageProps {
  gigs: Gig[];
}

export function MyGigsPage({ gigs: initialGigs }: MyGigsPageProps) {
  const [gigs, setGigs] = useState(initialGigs);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  const filteredGigs = gigs.filter(gig => {
    if (filter === 'active') return gig.isActive;
    if (filter === 'paused') return !gig.isActive;
    return true;
  });

  const stats = {
    total: gigs.length,
    active: gigs.filter(g => g.isActive).length,
    paused: gigs.filter(g => !g.isActive).length,
    totalViews: gigs.reduce((sum, g) => sum + g.views, 0),
    totalOrders: gigs.reduce((sum, g) => sum + g.orderCount, 0),
  };

  const handleToggleActive = async (gigId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/gigs/${gigId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setGigs(gigs.map(gig => 
          gig.id === gigId ? { ...gig, isActive: !currentStatus } : gig
        ));
        toast.success(`Gig ${!currentStatus ? 'activated' : 'paused'} successfully`);
      } else {
        // Show detailed error message with missing fields
        if (data.message && data.details) {
          toast.error(`${data.message}\n${data.details}`);
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error('Failed to update gig status');
        }
      }
    } catch (error) {
      toast.error('Failed to update gig status');
    }
  };

  const handleDelete = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/gigs/${gigId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setGigs(gigs.filter(gig => gig.id !== gigId));
        toast.success('Gig deleted successfully');
      } else if (data.hasOrders) {
        toast.error(data.error || 'Cannot delete gig with existing orders. Try pausing it instead.');
      } else {
        throw new Error(data.error || 'Failed to delete gig');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete gig');
    }
  };

  const handleDuplicate = async (gigId: string) => {
    try {
      const response = await fetch(`/api/gigs/${gigId}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setGigs([result.gig, ...gigs]);
        toast.success('Gig duplicated successfully! Edit it to customize.');
      } else {
        throw new Error('Failed to duplicate gig');
      }
    } catch (error) {
      toast.error('Failed to duplicate gig');
    }
  };

  return (
    <div className="min-h-screen bg-[#e6ddcf]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-serif font-semibold text-gray-900">My Gigs</h1>
            <p className="text-gray-600">Manage and track your service listings</p>
          </div>
          <Link href="/gigs/create">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Gig
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="text-sm text-gray-600 mb-1">Total Gigs</div>
            <div className="text-3xl font-serif font-semibold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-serif font-semibold text-emerald-600">{stats.active}</div>
          </Card>
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="text-sm text-gray-600 mb-1">Paused</div>
            <div className="text-3xl font-serif font-semibold text-gray-400">{stats.paused}</div>
          </Card>
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="text-sm text-gray-600 mb-1">Total Views</div>
            <div className="text-3xl font-serif font-semibold text-gray-900">{stats.totalViews}</div>
          </Card>
          <Card className="border-gray-200 bg-white p-6 rounded-3xl">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-3xl font-serif font-semibold text-gray-900">{stats.totalOrders}</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' 
              ? 'bg-gray-900 text-white rounded-full' 
              : 'border-gray-300 text-gray-700 rounded-full hover:bg-white'
            }
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' 
              ? 'bg-gray-900 text-white rounded-full' 
              : 'border-gray-300 text-gray-700 rounded-full hover:bg-white'
            }
          >
            Active ({stats.active})
          </Button>
          <Button
            variant={filter === 'paused' ? 'default' : 'outline'}
            onClick={() => setFilter('paused')}
            className={filter === 'paused' 
              ? 'bg-gray-900 text-white rounded-full' 
              : 'border-gray-300 text-gray-700 rounded-full hover:bg-white'
            }
          >
            Paused ({stats.paused})
          </Button>
        </div>

        {/* Gigs List */}
        {filteredGigs.length === 0 ? (
          <Card className="border-gray-200 bg-white p-12 rounded-3xl text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No gigs yet' : `No ${filter} gigs`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Create your first gig to start selling your services' 
                : `You don't have any ${filter} gigs at the moment`
              }
            </p>
            {filter === 'all' && (
              <Link href="/gigs/create">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Gig
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGigs.map((gig) => (
              <Card key={gig.id} className="border-gray-200 bg-white rounded-3xl overflow-hidden">
                <div className="flex gap-6 p-6">
                  {/* Gig Image */}
                  <div className="relative w-48 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                    {gig.images.length > 0 ? (
                      <Image
                        src={gig.images[0]}
                        alt={gig.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Gig Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            href={`/gigs/${gig.id}`}
                            className="text-xl font-serif font-semibold text-gray-900 hover:text-gray-700 transition-colors line-clamp-1"
                          >
                            {gig.title}
                          </Link>
                          {!gig.isActive && (
                            <Badge variant="outline" className="border-gray-300 text-gray-600 rounded-full">
                              Paused
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full mb-3">
                          {gig.category.name}
                        </Badge>
                      </div>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 rounded-2xl shadow-lg">
                          <DropdownMenuItem asChild>
                            <Link href={`/gigs/${gig.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Gig
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/gigs/${gig.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Gig
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/gigs/${gig.id}/analytics`} className="flex items-center cursor-pointer">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(gig.id, gig.isActive)}>
                            {gig.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Pause Gig
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Activate Gig
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(gig.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Gig
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(gig.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Gig
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{gig.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>{gig.orderCount} orders</span>
                      </div>
                      {gig.reviewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{gig.rating.toFixed(1)} ({gig.reviewCount})</span>
                        </div>
                      )}
                      <div className="ml-auto">
                        <span className="text-2xl font-serif font-semibold text-gray-900">
                          ₹{Number(gig.price).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
