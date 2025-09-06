"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Users,
  TrendingUp,
  AlertCircle,
  Star,
  Settings
} from "lucide-react";

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  canceledBookings: number;
  upcomingBookings: number;
  totalEarnings: number;
  totalServices: number;
};

type RecentBooking = {
  id: number;
  scheduled_at: string;
  status: string;
  total_price: number;
  user: { id: number; name: string | null; email: string };
  service: { id: number; name: string };
};

type PendingAction = {
  id: number;
  scheduled_at: string;
  total_price: number;
  user: { id: number; name: string | null; email: string };
  service: { id: number; name: string; auto_confirm: boolean };
};

type ServiceStat = {
  id: number;
  name: string;
  auto_confirm: boolean;
  _count: { bookings: number };
};

type Provider = {
  id: number;
  name: string;
  average_rating: number | null;
  rating_count: number | null;
  verified: boolean;
};

type DashboardData = {
  stats: DashboardStats;
  recentBookings: RecentBooking[];
  pendingActions: PendingAction[];
  serviceStats: ServiceStat[];
  provider: Provider;
};

export default function ProviderDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadDashboard = async () => {
    try {
      const res = await fetch("/api/provider/dashboard", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        setError("You must be a provider to access this page.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load dashboard");
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleBookingAction = async (bookingId: number, action: 'confirm' | 'decline', reason?: string) => {
    setActionLoading(bookingId);
    try {
      const endpoint = action === 'confirm' ? '/api/provider/bookings/confirm' : '/api/provider/bookings/decline';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId, reason })
      });
      
      if (!res.ok) throw new Error(`Failed to ${action} booking`);
      
      // Reload dashboard to reflect changes
      await loadDashboard();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No data available</div>;

  const { stats, recentBookings, pendingActions, serviceStats, provider } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {provider.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          {provider.verified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </span>
          )}
          {provider.average_rating && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 mr-1" />
              {provider.average_rating.toFixed(1)} ({provider.rating_count})
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid - All Count Snapshots (2 Rows) */}
      <div className="space-y-4">
        {/* First Row - Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">₱{(stats.totalEarnings / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Booking Status Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xs text-gray-500 mb-1">Non auto-confirm only</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-600">Canceled</p>
                  <p className="text-2xl font-bold">{stats.canceledBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions for Pending Bookings */}
      {pendingActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending Approvals ({pendingActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{booking.service.name}</div>
                    <div className="text-sm text-gray-600">
                      {booking.user.name || booking.user.email} • {new Date(booking.scheduled_at).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium">₱{(booking.total_price / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      disabled={actionLoading === booking.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === booking.id ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingAction(booking.id, 'decline', 'Provider declined')}
                      disabled={actionLoading === booking.id}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid - Recent Bookings and Service Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Bookings
              <Link href="/provider/bookings">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{booking.service.name}</div>
                      <div className="text-sm text-gray-600">
                        {booking.user.name || booking.user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </div>
                      <div className="text-sm font-medium mt-1">
                        ₱{(booking.total_price / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Service Performance
              <Link href="/provider/services">
                <Button variant="outline" size="sm">Manage Services</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceStats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No services added yet</p>
            ) : (
              <div className="space-y-3">
                {serviceStats.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        {service.auto_confirm ? 'Auto-confirm enabled' : 'Manual approval required'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{service._count.bookings} bookings</div>
                      <div className="text-xs text-gray-500">
                        {stats.totalServices} total services
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
