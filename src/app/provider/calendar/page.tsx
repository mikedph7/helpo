"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CalendarBooking = {
  id: number;
  scheduled_at: string;
  status: string;
  total_price: number;
  user: { name: string | null; email: string };
  service: { name: string; duration_minutes?: number };
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

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProviderCalendarPage() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const router = useRouter();

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

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduled_at);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="min-h-16 sm:min-h-24 p-1 sm:p-2"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayBookings = getBookingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      calendarDays.push(
        <div
          key={day}
          className={`min-h-16 sm:min-h-24 p-1 sm:p-2 border border-gray-200 bg-white ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
          <div className={`text-xs sm:text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayBookings.slice(0, window.innerWidth < 640 ? 1 : 3).map((booking) => (
              <Link key={booking.id} href={`/provider/bookings/${booking.id}`}>
                <div className={`text-xs p-0.5 sm:p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(booking.status)}`}>
                  <div className="font-medium truncate text-xs sm:text-sm">{booking.service.name}</div>
                  <div className="hidden sm:flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      {new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {dayBookings.length > (window.innerWidth < 640 ? 1 : 3) && (
              <div className="text-xs text-gray-600 font-medium">
                +{dayBookings.length - (window.innerWidth < 640 ? 1 : 3)} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return calendarDays;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-7 gap-px mb-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            onClick={() => router.push('/provider/bookings')} 
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              Calendar
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">View your bookings in calendar format</p>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="px-2 sm:px-4"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="px-2 sm:px-4"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map((day, index) => (
              <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-600 bg-gray-50">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-100 border border-yellow-200 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100 border border-green-200 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-100 border border-blue-200 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-100 border border-red-200 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-600">Canceled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Bookings */}
      {(() => {
        const today = new Date();
        const todayBookings = getBookingsForDate(today);
        
        if (todayBookings.length === 0) return null;
        
        return (
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Today's Bookings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3">
                {todayBookings.map((booking) => (
                  <Link key={booking.id} href={`/provider/bookings/${booking.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-2 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="font-medium text-sm sm:text-base">
                            {new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.service.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 flex-shrink-0" />
                            {booking.user.name || booking.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
                        <Badge className={`${getStatusColor(booking.status)} text-xs sm:text-sm`}>
                          {booking.status}
                        </Badge>
                        <span className="font-medium text-sm sm:text-base">
                          ₱{(booking.total_price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
