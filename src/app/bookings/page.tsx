"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MessageCircle, MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

type BookingStatus = "confirmed" | "pending" | "completed" | "canceled";

type Booking = {
  id: number;
  service: {
    id: number;
    name: string;
    category: string;
    images: string[];
    provider: {
      id: number;
      name: string;
      photo_url: string;
      average_rating: number;
      rating_count: number;
      location: string;
      bio: string;
    };
  };
  scheduled_at: string;
  location?: string;
  status: BookingStatus;
  total_price: number;
  notes?: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

const statusConfig = {
  confirmed: { 
    label: "Confirmed", 
    color: "bg-green-100 text-green-800",
    description: "Your booking is confirmed"
  },
  pending: { 
    label: "Pending", 
    color: "bg-yellow-100 text-yellow-800",
    description: "Waiting for provider confirmation"
  },
  completed: { 
    label: "Completed", 
    color: "bg-blue-100 text-blue-800",
    description: "Service has been completed"
  },
  canceled: { 
    label: "Canceled", 
    color: "bg-red-100 text-red-800",
    description: "This booking was canceled"
  }
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const scheduledDate = new Date(booking.scheduled_at);
  const isUpcoming = scheduledDate > new Date();
  const isPast = scheduledDate < new Date() && booking.status !== "canceled";
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          {/* Service Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={booking.service.images[0] || '/placeholder-service.jpg'}
              alt={booking.service.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {booking.service.name}
                </h3>
                <div className="flex items-center mt-1 space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="h-5 w-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {booking.service.provider.photo_url ? (
                        <img 
                          src={booking.service.provider.photo_url} 
                          alt={booking.service.provider.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                          {booking.service.provider.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{booking.service.provider.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{booking.service.provider.average_rating}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatDate(scheduledDate)}
              </div>
              {booking.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{booking.location}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">
                ${booking.total_price}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                {booking.location && isUpcoming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-sm"
                >
                  <Link href={`/bookings/${booking.id}`}>
                    {isUpcoming ? "Manage" : "View"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ 
  title, 
  description, 
  actionText, 
  actionHref 
}: { 
  title: string; 
  description: string; 
  actionText?: string; 
  actionHref?: string; 
}) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {actionText && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchBookings = async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            user_id: '1' // Using test user ID that has actual bookings
          });
          
          if (searchQuery) {
            params.append('search', searchQuery);
          }
          
          const response = await fetch(`/api/dev/bookings?${params}`);
          if (response.ok) {
            const data = await response.json();
            setBookings(data.bookings || []);
          } else {
            console.error('Failed to fetch bookings');
          }
        } catch (error) {
          console.error('Error fetching bookings:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchBookings();
    }, searchQuery ? 300 : 0); // 300ms delay for search, immediate for initial load

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const scheduledDate = new Date(booking.scheduled_at);
    
    let matchesTab = false;
    switch (activeTab) {
      case "upcoming":
        matchesTab = scheduledDate > now && booking.status !== "canceled";
        break;
      case "past":
        matchesTab = (scheduledDate < now || booking.status === "completed") && booking.status !== "canceled";
        break;
      case "canceled":
        matchesTab = booking.status === "canceled";
        break;
    }

    const matchesSearch = !searchQuery || 
      booking.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.provider.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getEmptyStateProps = () => {
    switch (activeTab) {
      case "upcoming":
        return {
          title: "No upcoming bookings",
          description: "You don't have any upcoming bookings yet. Book a service to get started!",
          actionText: "Browse Services",
          actionHref: "/services"
        };
      case "past":
        return {
          title: "No past bookings",
          description: "Your completed and past bookings will appear here.",
          actionText: "Book a Service",
          actionHref: "/services"
        };
      case "canceled":
        return {
          title: "No canceled bookings",
          description: "You don't have any canceled bookings.",
        };
      default:
        return {
          title: "No bookings found",
          description: "No bookings match your current filters.",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "upcoming" as const, label: "Upcoming" },
              { key: "past" as const, label: "Past" },
              { key: "canceled" as const, label: "Canceled" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {filteredBookings.length > 0 ? (
          <div>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState {...getEmptyStateProps()} />
        )}
      </div>
    </div>
  );
}
