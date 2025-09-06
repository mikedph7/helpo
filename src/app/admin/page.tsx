'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  pendingPayments: number;
  verifiedToday: number;
  totalBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingPayments: 0,
    verifiedToday: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // For now, we'll just fetch pending payments count
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const payments = await response.json();
        setStats(prev => ({
          ...prev,
          pendingPayments: payments.length
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and pending tasks
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Badge variant="destructive" className="h-6 px-2 text-xs">
              Urgent
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedToday}</div>
            <p className="text-xs text-muted-foreground">
              Payments processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Status
            </CardTitle>
            <Badge variant="outline" className="h-6 px-2 text-xs text-green-600">
              Online
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✅</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Verification</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and approve customer payment submissions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending verifications</span>
                <Badge variant="secondary">
                  {loading ? '...' : stats.pendingPayments}
                </Badge>
              </div>
              <Link href="/admin/payments">
                <Button className="w-full">
                  View Payment Queue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Platform administration and settings
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" disabled>
                User Management (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Service Settings (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Reports & Analytics (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full justify-start">
                🔍 Review Payments
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              📊 View Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              ⚙️ System Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
