export default function ProfilePage() {
  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        Profile
      </h1>
      
      <div className="max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">john.doe@example.com</p>
            <p className="text-sm text-gray-500">Member since August 2025</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/bookings" className="p-4 border rounded-xl hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-medium">My Bookings</h3>
                <p className="text-sm text-gray-500">View your service bookings</p>
              </div>
            </div>
          </a>
          
          <a href="/saved" className="p-4 border rounded-xl hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div>
                <h3 className="font-medium">Saved Services</h3>
                <p className="text-sm text-gray-500">Your favorite services</p>
              </div>
            </div>
          </a>
        </div>

        {/* Settings */}
        <div className="border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Account Settings</h3>
          <div className="space-y-3">
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50">
              <span>Edit Profile</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50">
              <span>Notification Settings</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50">
              <span>Payment Methods</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="flex items-center justify-between w-full p-3 text-left rounded-lg hover:bg-gray-50">
              <span>Help & Support</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
