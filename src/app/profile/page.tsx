"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  Calendar, 
  Heart, 
  Settings, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  User as UserIcon,
  Mail,
  Shield,
  Wallet
} from "lucide-react";
import Link from "next/link";
import WalletComponent from "@/components/wallet-component";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="max-w-2xl space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
      
      <div className="max-w-2xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user.name || 'User'}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()} Account</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Link href="/bookings" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">My Bookings</h3>
                  <p className="text-sm text-gray-500">View your service bookings</p>
                </div>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Link href="/saved" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium">Saved Services</h3>
                  <p className="text-sm text-gray-500">Your favorite services</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Section */}
        <WalletComponent userId={user.id} initialBalance={0} />

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Total Bookings</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-500">Saved Services</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span>Edit Profile</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-500" />
                <span>Notification Settings</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>Payment Methods</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span>Help & Support</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <div className="pt-3 border-t">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
