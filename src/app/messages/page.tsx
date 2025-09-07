import React, { Suspense } from 'react'
import MessagesClient from './MessagesClient'

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-3 md:px-6 py-4 md:py-6">Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  )
}
