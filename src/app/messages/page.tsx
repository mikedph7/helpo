export default function MessagesPage() {
  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
        Messages
      </h1>
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
        <p className="text-gray-500 mb-6">Chat with service providers about your bookings and requests.</p>
        <a href="/services" className="text-blue-600 hover:text-blue-700 font-medium">
          Book a Service →
        </a>
      </div>
    </div>
  );
}
