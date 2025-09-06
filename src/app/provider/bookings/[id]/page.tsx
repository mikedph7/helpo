"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  MessageCircle,
  Check,
  X,
  AlertCircle,
  MapIcon
} from "lucide-react";
import Link from "next/link";

type BookingDetail = {
  id: number;
  scheduled_at: string;
  status: string;
  total_price: number;
  location?: string;
  notes?: string;
  payment_status: string;
  provider_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  user: { 
    id: number; 
    name: string | null; 
    email: string; 
    phone?: string;
    avatar?: string;
  };
  service: { 
    id: number; 
    name: string; 
    description?: string;
    duration_minutes?: number;
    category: string;
    images?: string[];
    auto_confirm: boolean;
  };
};

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
    case 'pending': return 'Awaiting Your Confirmation';
    case 'confirmed': return 'Confirmed & Scheduled';
    case 'completed': return 'Service Completed';
    case 'canceled': return 'Canceled';
    default: return status;
  }
};

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBookingId(parseInt(resolvedParams.id, 10));
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/provider/bookings/${bookingId}`, { 
          credentials: "include" 
        });
        
        if (res.status === 401 || res.status === 403) {
          setError("You must be a provider to access this page.");
          return;
        }
        
        if (res.status === 404) {
          setError("Booking not found.");
          return;
        }
        
        if (!res.ok) throw new Error("Failed to load booking details");
        
        const data = await res.json();
        setBooking(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleBookingAction = async (action: 'confirm' | 'decline' | 'cancel' | 'complete') => {
    if (!booking) return;
    
    setActionLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      let body = {};

      switch (action) {
        case 'confirm':
          endpoint = `/api/provider/bookings/${booking.id}/confirm`;
          break;
        case 'decline':
          endpoint = `/api/provider/bookings/${booking.id}/decline`;
          break;
        case 'cancel':
          endpoint = `/api/provider/bookings/${booking.id}/cancel`;
          body = { reason: cancelReason };
          break;
        case 'complete':
          endpoint = `/api/provider/bookings/${booking.id}/complete`;
          break;
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...(Object.keys(body).length > 0 ? { body: JSON.stringify(body) } : {})
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${action} booking`);
      }

      const result = await res.json();
      
      // Show success message if provided
      if (result.message) {
        // You could use a toast/notification system here
        // For now, we'll just reload to show the updated state
        console.log('Action result:', result.message);
      }

      // Reload booking details to show updated state
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading(false);
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
              <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="h-32 sm:h-48 bg-gray-200 rounded"></div>
              <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-red-900 mb-2">
            {error || "Booking not found"}
          </h3>
          <div className="space-x-4">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          size="sm"
          className="hover:bg-gray-100 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Back to Bookings</span>
          <span className="xs:hidden">Back</span>
        </Button>
        <div className="h-4 border-l border-gray-300"></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Booking #{booking.id}
          </h1>
        </div>
        <Badge className={`${getStatusColor(booking.status)} font-medium text-xs sm:text-sm flex-shrink-0`}>
          {getStatusText(booking.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">
                  {booking.service.name}
                </h3>
                <p className="text-gray-600 capitalize text-sm sm:text-base">
                  {booking.service.category} Service
                </p>
                {booking.service.description && (
                  <p className="text-gray-700 mt-2 text-sm sm:text-base">
                    {booking.service.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-sm sm:text-base">
                      {booking.service.duration_minutes ? 
                        `${booking.service.duration_minutes} minutes` : 
                        'Not specified'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Price</p>
                    <p className="font-medium text-sm sm:text-base">₱{(booking.total_price / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {new Date(booking.scheduled_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    {new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                    {booking.location || 'No location specified'}
                  </p>
                  {booking.location && (
                    <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                      <MapIcon className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {booking.notes && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-gray-700 text-sm sm:text-base break-words">{booking.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {booking.user.avatar ? (
                    <img 
                      src={booking.user.avatar} 
                      alt={booking.user.name || 'Customer'}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {booking.user.name || 'Customer'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Customer</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${booking.user.email}`}
                    className="text-xs sm:text-sm text-blue-600 hover:underline break-all"
                  >
                    {booking.user.email}
                  </a>
                </div>
                {booking.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`tel:${booking.user.phone}`}
                      className="text-xs sm:text-sm text-blue-600 hover:underline"
                    >
                      {booking.user.phone}
                    </a>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // TODO: Implement messaging system
                  alert('Messaging system coming soon!');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message Customer
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">₱{(booking.total_price / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
                    {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              {booking.status === 'pending' && !booking.service.auto_confirm && (
                <div className="space-y-3">
                  {/* Check if provider already approved */}
                  {booking.provider_confirmed_at ? (
                    // Provider already approved - waiting for payment or confirmation
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        ✓ You've already approved this booking. 
                        {booking.payment_status === 'paid' 
                          ? ' Booking will confirm automatically.'
                          : ' Waiting for payment verification to confirm.'
                        }
                      </p>
                    </div>
                  ) : booking.payment_status === 'paid' ? (
                    // Payment verified - provider can approve/decline
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                          ✓ Payment verified. You can now approve or decline this booking.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleBookingAction('confirm')}
                          disabled={actionLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Confirm Booking
                        </Button>
                        <Button
                          onClick={() => handleBookingAction('decline')}
                          disabled={actionLoading}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline Booking
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Payment not verified - show approval options but explain status will stay pending
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700">
                          ⏳ Payment pending verification. You can pre-approve this booking, but it will remain pending until payment is verified by admin.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleBookingAction('confirm')}
                          disabled={actionLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Pre-approve Booking
                        </Button>
                        <Button
                          onClick={() => handleBookingAction('decline')}
                          disabled={actionLoading}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline Booking
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Pre-approving means the booking will automatically confirm once payment is verified.
                      </div>
                    </>
                  )}
                </div>
              )}

              {booking.status === 'pending' && booking.service.auto_confirm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    ⚡ Auto-confirm service. Booking will automatically confirm once payment is verified.
                  </p>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="space-y-2">
                  <Button
                    onClick={() => handleBookingAction('complete')}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}

              {(booking.status === 'completed' || booking.status === 'canceled') && (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    No actions available for {booking.status} bookings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel this booking? The customer will be automatically refunded.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Optional)
              </label>
              <Textarea
                placeholder="Provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                Keep Booking
              </Button>
              <Button
                onClick={() => handleBookingAction('cancel')}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Canceling...' : 'Cancel Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
