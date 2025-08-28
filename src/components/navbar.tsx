"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Simple SVG icons as components
const ServicesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SavedIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BookingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MessagesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const navItems = [
  { href: "/services", label: "Services", icon: ServicesIcon },
  { href: "/saved", label: "Saved", icon: SavedIcon },
  { href: "/bookings", label: "Bookings", icon: BookingsIcon },
  { href: "/messages", label: "Messages", icon: MessagesIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  
  // Check if we're on different pages
  const isLandingPage = pathname === '/';
  const isServicesHomePage = pathname === '/services';
  const isServiceDetailsPage = pathname.startsWith('/services/') && pathname !== '/services';
  const isBookingPage = pathname.startsWith('/bookings/');

  // Hide navbar completely on landing page
  if (isLandingPage) {
    return null;
  }

  // Show only top header with logo on booking and service details pages
  if (isBookingPage || isServiceDetailsPage) {
    return (
      <>
        {/* Desktop Header - Logo Only */}
        <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur hidden md:block">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/services" className="text-lg font-bold text-blue-600">
              helpo
            </Link>
          </nav>
        </header>

        {/* Mobile Header - Logo Only */}
        <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur md:hidden">
          <div className="flex h-14 items-center justify-center px-4">
            <Link href="/services" className="text-lg font-bold text-blue-600">
              helpo
            </Link>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      {/* Desktop Navbar - Top */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur hidden md:block">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/services" className="text-lg font-bold text-blue-600">
            helpo
          </Link>
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Header - Top */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-center px-4">
          <Link href="/services" className="text-lg font-bold text-blue-600">
            helpo
          </Link>
        </div>
      </header>

      {/* Mobile Navbar - Bottom */}
      {!isServiceDetailsPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <Icon />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    
    </>
  );
}
