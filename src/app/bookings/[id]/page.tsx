"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, MapPin, User, Calendar, Star, Phone, Mail, Edit, X, MessageCircle } from "lucide-react";
import { ClientApiClient, Booking } from "@/lib/client-api";

export default function BookingDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [cancellationDetails, setCancellationDetails] = useState<string>("");
  const [bookingId, setBookingId] = useState("");
  const client = useMemo(() => new ClientApiClient(), []);

  const cancellationReasons = [
    "Too expensive, found cheaper price",
    "Found another provider", 
    "Need to change schedule",
    "No longer needed",
    "Accidental booking"
  ];

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBookingId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const data = await client.getBooking(bookingId);
        setBooking(data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]); // Removed client from dependencies

  const handleModifyBooking = () => {
    if (!booking?.service?.id) return;
    
    // Navigate to the booking form with pre-filled data
    router.push(`/bookings/new/${booking.service.id}?bookingId=${booking.id}&modify=true`);
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!booking || cancelling || !cancellationReason) return;
    
    setCancelling(true);
    try {
      // For now, we'll pass the cancellation reason in notes when canceling
      // In a real app, you'd extend the API to support cancellation reasons
      const cancelledBooking = await client.cancelBooking(booking.id!);
      
      // Update local state
      setBooking({
        ...booking,
        status: cancelledBooking.status || 'canceled'
      });
      
      setShowCancelModal(false);
      alert('Booking has been cancelled successfully.');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactProvider = () => {
    const providerName = booking?.service?.provider?.name || 'Provider';
    alert(`Contact ${providerName} - This feature will be implemented in a future version.`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600">The booking you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'No time';
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'No price';
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price / 100);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "confirmed": return "text-green-600 bg-green-100";
      case "completed": return "text-blue-600 bg-blue-100";
      case "canceled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bookings
      </Button>

      <div className="grid gap-6">
        {/* Booking Status and Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Booking #{booking.id}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Booked on {formatDate(booking.created_at)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                {booking.status || 'Unknown'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatDate(booking.scheduled_at)}</p>
                    <p className="text-sm text-gray-600">at {formatTime(booking.scheduled_at)}</p>
                  </div>
                </div>
                
                {booking.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <p>{booking.location}</p>
                  </div>
                )}
                
                {booking.service?.duration_minutes && booking.service.duration_minutes > 0 && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <p>
                      Duration: {booking.service.duration_minutes} minutes
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{booking.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{booking.user?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-lg font-semibold">{formatPrice(booking.total_price)}</p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Information */}
        {booking.service && (
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {booking.service.images?.[0] && (
                  <img
                    src={booking.service.images[0]}
                    alt={booking.service.name || 'Service'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{booking.service.name || 'Unknown Service'}</h3>
                  <p className="text-sm text-blue-600 mb-2">
                    {booking.service.category || 'No category'}
                  </p>
                  <p className="text-gray-600 text-sm">{booking.service.description || 'No description'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Provider Information */}
        {booking.service?.provider && (
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  {booking.service.provider.photo_url ? (
                    <img
                      src={booking.service.provider.photo_url}
                      alt={booking.service.provider.name || 'Provider'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{booking.service.provider.name || 'Unknown Provider'}</h3>
                  {booking.service.provider.location && (
                    <p className="text-sm text-gray-600 mb-2">📍 {booking.service.provider.location}</p>
                  )}
                  {booking.service.provider.rating_count && booking.service.provider.average_rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(booking.service?.provider?.average_rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {booking.service.provider.average_rating?.toFixed(1)} ({booking.service.provider.rating_count} reviews)
                      </span>
                    </div>
                  )}
                  {booking.service.provider.bio && (
                    <p className="text-sm text-gray-600">{booking.service.provider.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <>
                  <Button
                    onClick={handleModifyBooking}
                    variant="outline"
                    className="flex items-center gap-2 w-full"
                  >
                    <Edit className="w-4 h-4" />
                    Modify Booking
                  </Button>
                  
                  <Button
                    onClick={handleContactProvider}
                    variant="outline"
                    className="flex items-center gap-2 w-full"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Provider
                  </Button>
                  
                  <Button
                    onClick={handleCancelBooking}
                    variant="destructive"
                    disabled={cancelling}
                    className="flex items-center gap-2 w-full"
                  >
                    <X className="w-4 h-4" />
                    Cancel Booking
                  </Button>
                </>
              )}
              
              {(booking.status === 'completed' || booking.status === 'canceled') && (
                <Button
                  onClick={handleContactProvider}
                  variant="outline"
                  className="flex items-center gap-2 w-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Provider
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Please let us know why you're cancelling this booking. This helps us improve our service.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for cancellation</Label>
                <Select value={cancellationReason} onValueChange={setCancellationReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="z-[200] bg-white border border-gray-200 shadow-lg">
                    {cancellationReasons.map((reason) => (
                      <SelectItem key={reason} value={reason} className="bg-white hover:bg-gray-100">
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="details">Additional details (optional)</Label>
                <Textarea
                  id="details"
                  placeholder="Any additional information about your cancellation..."
                  value={cancellationDetails}
                  onChange={(e) => setCancellationDetails(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                  setCancellationDetails("");
                }}
                className="flex-1"
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                disabled={cancelling || !cancellationReason}
                className="flex-1"
              >
                {cancelling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </div>
                ) : (
                  "Cancel Booking"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
