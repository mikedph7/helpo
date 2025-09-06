"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  Clock, 
  DollarSign, 
  HelpCircle,
  Settings,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";

const sidebarItems = [
  { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/bookings", label: "Bookings", icon: Calendar },
  { href: "/provider/services", label: "Services", icon: Wrench },
  { href: "/provider/schedule", label: "Schedule", icon: Clock },
  { href: "/provider/earnings", label: "Earnings", icon: DollarSign },
];

const supportItems = [
  { href: "/provider/support", label: "Support", icon: HelpCircle },
];

export default function ProviderNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [providerName, setProviderName] = useState<string>("Provider");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current page is a login page
  const isLoginPage = pathname.includes("/auth/login");

  // If it's a login page, render children without navigation
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Fetch provider info
  useEffect(() => {
    const fetchProviderInfo = async () => {
      try {
        const response = await fetch('/api/provider/dashboard', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.provider?.name) {
            setProviderName(data.provider.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch provider info:', error);
      }
    };

    fetchProviderInfo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push('/provider/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link href="/provider" className="text-xl font-bold text-blue-600">
            helpo Provider
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col h-full">
          <div className="flex-1 px-4 py-6 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Support Section */}
            <div className="space-y-1">
              {supportItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
          <nav className="flex h-16 items-center justify-between px-6">
            {/* Provider Name */}
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">{providerName}</h2>
            </div>

            {/* Right side - Settings and Profile */}
            <div className="flex items-center gap-4">
              {/* Settings Button */}
              <button
                onClick={() => router.push('/provider/settings')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/provider/settings' 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                  <ChevronDown className="w-4 h-4" />
                </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    href="/provider/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
