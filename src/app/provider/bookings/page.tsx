"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Check, X, MoreVertical } from "lucide-react";
import Link from "next/link";

type ProviderBooking = {
  id: number;
  scheduled_at: string;
  status: string;
  total_price: number;
  location?: string;
  notes?: string;
  payment_status: string;
  provider_confirmed_at?: string;
  user: { id: number; name: string | null; email: string; phone?: string };
  service: { id: number; name: string; duration_minutes?: number; auto_confirm: boolean };
};

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'canceled';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Awaiting Confirmation';
    case 'confirmed': return 'Confirmed';
    case 'completed': return 'Completed';
    case 'canceled': return 'Canceled';
    default: return status;
  }
};

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadBookings = async () => {
    try {
      const res = await fetch("/api/provider/bookings", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        setError("You must be a provider to access this page.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load provider bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleBookingAction = async (bookingId: number, action: 'confirm' | 'decline') => {
    setActionLoading(bookingId);
    try {
      const endpoint = action === 'confirm' ? 'confirm' : 'decline';
      const res = await fetch(`/api/provider/bookings/${bookingId}/${endpoint}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${action} booking`);
      }

      // Reload bookings to reflect changes
      await loadBookings();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getTabCount = (status: BookingFilter) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              loadBookings();
            }} 
            className="mt-2"
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your service bookings and customer requests</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/provider/calendar" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Calendar View</span>
              <span className="xs:hidden">Calendar</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs - Mobile Scroll, Desktop Grid */}
      <div className="mb-6">
        <div className="sm:hidden">
          {/* Mobile: Horizontal scroll tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide">
            {[
              { key: 'all' as BookingFilter, label: 'All' },
              { key: 'pending' as BookingFilter, label: 'Pending' },
              { key: 'confirmed' as BookingFilter, label: 'Confirmed' },
              { key: 'completed' as BookingFilter, label: 'Completed' },
              { key: 'canceled' as BookingFilter, label: 'Canceled' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.key ? 'bg-gray-100' : 'bg-gray-200'
                }`}>
                  {getTabCount(tab.key)}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="hidden sm:flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {/* Desktop: Regular tabs */}
          {[
            { key: 'all' as BookingFilter, label: 'All' },
            { key: 'pending' as BookingFilter, label: 'Pending' },
            { key: 'confirmed' as BookingFilter, label: 'Confirmed' },
            { key: 'completed' as BookingFilter, label: 'Completed' },
            { key: 'canceled' as BookingFilter, label: 'Canceled' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === tab.key ? 'bg-gray-100' : 'bg-gray-200'
              }`}>
                {getTabCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'When customers book your services, they\'ll appear here.'
                : `You don't have any ${filter} bookings at the moment.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  {/* Mobile: Stack everything vertically, Desktop: Keep horizontal layout */}
                  
                  {/* Service & Status - Always on top */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        {booking.service.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Booking #{booking.id}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} font-medium text-xs sm:text-sm`}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>

                  {/* Details Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Customer Info */}
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {booking.user.name || 'Customer'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{booking.user.email}</p>
                        {booking.user.phone && (
                          <p className="text-xs sm:text-sm text-gray-600">{booking.user.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {new Date(booking.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                          {booking.service.duration_minutes && (
                            <span className="ml-1 sm:ml-2">
                              ({booking.service.duration_minutes}min)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Location & Price */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          ₱{(booking.total_price / 100).toFixed(2)}
                        </p>
                        {booking.location && (
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">
                            {booking.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes - Full width */}
                  {booking.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Customer notes:</span> {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions - Mobile: Stack vertically, Desktop: Horizontal */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-2 border-t border-gray-100">
                    {/* Status-based Action Buttons */}
                    {booking.status === 'pending' && !booking.service.auto_confirm && (
                      <div className="flex flex-col gap-2 w-full">
                        {/* Status indicator */}
                        {booking.provider_confirmed_at ? (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            ✓ Pre-approved • {booking.payment_status === 'paid' ? 'Payment verified' : 'Awaiting payment verification'}
                          </div>
                        ) : booking.payment_status === 'paid' ? (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Payment verified • Ready for approval
                          </div>
                        ) : (
                          <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            ⏳ Payment pending verification
                          </div>
                        )}
                        
                        {/* Action buttons - only show if not already approved */}
                        {!booking.provider_confirmed_at && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                            <Button
                              onClick={() => handleBookingAction(booking.id, 'confirm')}
                              disabled={actionLoading === booking.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                            >
                              {actionLoading === booking.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              {actionLoading === booking.id ? 'Processing...' : (booking.payment_status === 'paid' ? 'Confirm' : 'Pre-approve')}
                            </Button>
                            <Button
                              onClick={() => handleBookingAction(booking.id, 'decline')}
                              disabled={actionLoading === booking.id}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <Link href={`/provider/bookings/${booking.id}`} className="sm:ml-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
