"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Star, Clock, MapPin, Calendar, X } from "lucide-react";
import { ClientApiClient, Service, Provider, Booking } from "@/lib/client-api";
import PaymentComponent from "@/components/payment-component";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  available: boolean;
  period: 'morning' | 'noon' | 'afternoon';
}

interface BookingData {
  service: Service;
  provider: Provider;
  availability: {
    available_dates: string[];
    time_slots: TimeSlot[];
  };
}

export default function NewBooking({ params }: { params: Promise<{ serviceId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [serviceId, setServiceId] = useState<string>("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isModifyMode, setIsModifyMode] = useState(false);

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    method: 'wallet' | 'manual';
    referenceNumber?: string;
    proofImageUrl?: string;
    selectedPaymentMethod?: string;
  } | null>(null);
  const [prepaidPaymentId, setPrepaidPaymentId] = useState<number | null>(null);

  const client = useMemo(() => new ClientApiClient(), []);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  // Get params and search params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setServiceId(resolvedParams.serviceId);
      setBookingId(searchParams.get('bookingId'));
      setIsModifyMode(searchParams.get('modify') === 'true');
    };
    getParams();
  }, [params, searchParams]);

  // Load service, provider and booking data
  useEffect(() => {
    if (!serviceId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get service and provider data
        const service = await client.getService(serviceId);
        const provider = await client.getProvider(service.provider_id.toString());
        
        // Get dynamic availability data
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = tomorrow.toISOString().split('T')[0];
        
        const availability = await client.getProviderAvailability(
          service.provider_id.toString(),
          defaultDate
        );

        setBookingData({ service, provider, availability });

        // If modify mode, fetch existing booking
        if (isModifyMode && bookingId) {
          const booking = await client.getBooking(bookingId);
          setExistingBooking(booking);
          
          // Pre-fill form with existing booking data
          const bookingDate = (booking.scheduled_at || '').split('T')[0];
          setSelectedDate(bookingDate);
          setLocation(booking.location || '');
          setNotes(booking.notes || '');
        } else {
          // Set default date to tomorrow for new bookings
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setSelectedDate(tomorrow.toISOString().split('T')[0]);
        }
      } catch (error) {
  console.error("Error loading booking data:", error);
  toast({ title: "Failed to load booking data", description: "Please try again.", variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, bookingId, isModifyMode]);

  // Effect to handle time slot selection after data is loaded
  useEffect(() => {
    if (isModifyMode && existingBooking && bookingData?.availability && !selectedTimeSlot) {
      const bookingDate = new Date(existingBooking.scheduled_at || '');
      const bookingHour = bookingDate.getHours();
      const bookingMinute = bookingDate.getMinutes();
      const bookingTimeFormatted = `${bookingHour.toString().padStart(2, '0')}:${bookingMinute.toString().padStart(2, '0')}`;
      
      console.log('🔍 Time slot selection debug:', {
        existingBooking: existingBooking.scheduled_at,
        bookingDate: bookingDate.toString(),
        bookingHour,
        bookingMinute,
        bookingTimeFormatted,
        availableSlots: bookingData.availability.time_slots.map(slot => ({ 
          id: slot.id, 
          start_time: slot.start_time, 
          label: slot.label,
          period: slot.period 
        }))
      });
      
      const matchingSlot = bookingData.availability.time_slots.find(slot => 
        slot.start_time === bookingTimeFormatted
      );
      
      console.log('🎯 Matching slot found:', matchingSlot);
      
      if (matchingSlot) {
        setSelectedTimeSlot(matchingSlot);
        console.log('✅ Set selected time slot:', matchingSlot);
      } else {
        console.log('❌ No matching slot found for time:', bookingTimeFormatted);
      }
    }
  }, [existingBooking, bookingData?.availability, selectedTimeSlot, isModifyMode]);

  // Function to refresh availability when date changes
  const refreshAvailability = async (newDate: string) => {
    if (!bookingData) return;
    
    try {
      const availability = await client.getProviderAvailability(
        bookingData.provider.id.toString(),
        newDate
      );
      
      setBookingData(prev => prev ? { ...prev, availability } : null);
      setSelectedTimeSlot(null); // Reset selected time slot when date changes
    } catch (error) {
      console.error("Error refreshing availability:", error);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    refreshAvailability(newDate);
  };

  const handleBooking = async () => {
    if (!bookingData || !selectedDate || !selectedTimeSlot) {
  toast({ title: "Missing selection", description: "Please select a date and time slot.", variant: 'warning' });
      return;
    }

    if (isModifyMode && existingBooking?.id) {
      // For modify mode, proceed directly with update (no payment required)
      setSubmitting(true);
      try {
        const scheduledAt = `${selectedDate}T${selectedTimeSlot.start_time}:00`;
        const booking = await client.updateBooking(existingBooking.id.toString(), {
          scheduled_at: scheduledAt,
          location: location || undefined,
          notes: notes || undefined,
        });
  toast({ title: "Booking updated", description: "Your booking has been updated.", variant: 'success' });
        router.push(`/bookings/${booking.id || existingBooking.id}`);
      } catch (error) {
  console.error("Booking update error:", error);
  toast({ title: "Update failed", description: "Please try again.", variant: 'destructive' });
      } finally {
        setSubmitting(false);
      }
    } else {
      // For new bookings, show payment modal first
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (paymentInfo?: any) => {
    if (!bookingData || !selectedDate || !selectedTimeSlot || !user) {
      toast({ title: "Authentication required", description: "Please log in to continue.", variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const scheduledAt = `${selectedDate}T${selectedTimeSlot.start_time}:00`;

      const amountCents = Math.round(Number(bookingData.service.price_from));

      if (paymentInfo?.method === 'wallet') {
        // Prepay via wallet and get a payment_id
        const resp = await fetch('/api/payments/wallet-prepay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, amount_cents: amountCents, memo: `Prepay for ${bookingData.service.name}` })
        });
        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err.error || 'Wallet prepay failed');
        }
        const prepay = await resp.json();
        setPrepaidPaymentId(prepay.payment_id);

        // Create booking with payment_id
        const booking = await client.createBooking({
          service_id: parseInt(serviceId),
          provider_id: bookingData.provider.id,
          user_id: user!.id,
          scheduled_at: scheduledAt,
          location: location || undefined,
          notes: notes || undefined,
          payment_id: prepay.payment_id
        } as any);

        setShowPaymentModal(false);
        toast({ title: 'Booking created', description: 'Your booking has been created.', variant: 'success' });
        router.push(`/bookings/${booking.id}`);
        return;
      }

      if (paymentInfo?.method === 'manual') {
        // Manual payments: create payment proof and booking together
        const response = await fetch('/api/payments/manual-prepay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user!.id,
            payment_method: paymentInfo.paymentMethod,
            reference_number: paymentInfo.referenceNumber,
            proof_image_url: paymentInfo.proofImageUrl,
            amount_cents: amountCents,
            service_id: parseInt(serviceId),
            provider_id: bookingData.provider.id,
            scheduled_at: scheduledAt,
            location: location || undefined,
            notes: notes || undefined
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit payment proof');
        }

        const result = await response.json();
        
        setShowPaymentModal(false);
        toast({ 
          title: 'Booking created', 
          description: 'Your booking has been created. Payment verification is pending.', 
          variant: 'success' 
        });
        
        if (result.booking_id) {
          router.push(`/bookings/${result.booking_id}`);
        } else {
          router.push('/bookings');
        }
        return;
      }

      throw new Error('Invalid payment method');
    } catch (error) {
  console.error("Booking creation error:", error);
  toast({ title: "Creation failed", description: "Please try again.", variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isModifyMode && existingBooking?.id) {
      router.push(`/bookings/${existingBooking.id}`);
    } else {
      router.back();
    }
  };

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading booking data</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const { service, provider, availability } = bookingData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {isModifyMode ? 'Modify' : 'Book'} Appointment
                </h1>
                <p className="text-gray-600 text-sm">{service.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* Left Column - Service & Provider Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {service.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-blue-600">
                    ₱{Number(service.price_from).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium">{provider.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{provider.average_rating?.toFixed(1) || 'New'}</span>
                  </div>
                </div>
              </div>
              {provider.bio && (
                <p className="text-gray-600 text-sm mt-3">{provider.bio}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={availability.available_dates[0]}
                  max={availability.available_dates[availability.available_dates.length - 1]}
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label>Available Time Slots</Label>
                <div className="space-y-4 mt-2">
                  {/* Morning Slots */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      Morning
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availability.time_slots
                        .filter(slot => slot.period === 'morning')
                        .map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlot(slot)}
                            disabled={!slot.available}
                            className={`justify-start text-xs transition-all duration-200 ${
                              selectedTimeSlot?.id === slot.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200 scale-105' 
                                : 'hover:bg-blue-50 hover:border-blue-300'
                            } ${!slot.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {slot.label}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Noon Slots */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Noon
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availability.time_slots
                        .filter(slot => slot.period === 'noon')
                        .map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlot(slot)}
                            disabled={!slot.available}
                            className={`justify-start text-xs transition-all duration-200 ${
                              selectedTimeSlot?.id === slot.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200 scale-105' 
                                : 'hover:bg-blue-50 hover:border-blue-300'
                            } ${!slot.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {slot.label}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Afternoon
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availability.time_slots
                        .filter(slot => slot.period === 'afternoon')
                        .map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlot(slot)}
                            disabled={!slot.available}
                            className={`justify-start text-xs transition-all duration-200 ${
                              selectedTimeSlot?.id === slot.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200 scale-105' 
                                : 'hover:bg-blue-50 hover:border-blue-300'
                            } ${!slot.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {slot.label}
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Enter specific location or address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes for your appointment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleBooking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitting || !selectedDate || !selectedTimeSlot}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isModifyMode ? 'Updating...' : 'Processing...'}
                </div>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {isModifyMode ? 'Update Booking' : 'Continue to Payment'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          
          {bookingData && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{bookingData.service.name}</h4>
                    <p className="text-sm text-gray-600">{bookingData.provider.name}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate && selectedTimeSlot && 
                        `${new Date(selectedDate).toLocaleDateString()} at ${selectedTimeSlot.label}`
                      }
                    </span>
                  </div>
                  {location && (
                    <div className="flex justify-between text-sm">
                      <span>Location:</span>
                      <span className="font-medium">{location}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span className="text-lg text-blue-600">
                      ₱{Number(bookingData.service.price_from).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Component */}
              <PaymentComponent
                bookingId={null} // New booking, no ID yet
                amount={Number(bookingData.service.price_from)}
                service={bookingData.service}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={() => setShowPaymentModal(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}