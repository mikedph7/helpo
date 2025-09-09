/**
 * Cron Job Configuration for Time Slot Management
 * 
 * This file contains configuration for automated time slot maintenance tasks.
 * In production, these would be set up with your hosting provider's cron job system
 * or a service like Vercel Cron Jobs.
 */

// Vercel Cron Jobs configuration (add to vercel.json)
export const vercelCronJobs = {
  "crons": [
    {
      "path": "/api/admin/time-slots/generate",
      "schedule": "0 2 * * *" // Daily at 2 AM UTC - Pre-generate slots for next 30 days
    },
    {
      "path": "/api/admin/time-slots/cleanup",
      "schedule": "0 3 * * 0" // Weekly on Sunday at 3 AM UTC - Cleanup old slots
    }
  ]
}

// Alternative: API route for manual cron triggering
export const cronEndpoints = {
  // Generate time slots for the next 30 days
  generateSlots: {
    endpoint: '/api/admin/time-slots',
    method: 'POST',
    payload: { daysAhead: 30 },
    frequency: 'daily'
  },
  
  // Cleanup slots older than 30 days
  cleanupSlots: {
    endpoint: '/api/admin/time-slots?daysOld=30',
    method: 'DELETE',
    frequency: 'weekly'
  }
}

// Performance monitoring thresholds
export const performanceThresholds = {
  maxTimeSlots: 50000, // Alert if total slots exceed this
  minAvailabilityRate: 0.3, // Alert if less than 30% slots available
  maxResponseTime: 1000 // Alert if API response > 1 second
}

// Usage instructions:
/**
 * PRODUCTION SETUP:
 * 
 * 1. For Vercel:
 *    - Add the vercelCronJobs configuration to your vercel.json
 *    - Deploy to enable automatic cron jobs
 * 
 * 2. For other hosting providers:
 *    - Set up cron jobs to call the API endpoints
 *    - Example crontab entries:
 *      0 2 * * * curl -X POST https://yourapp.com/api/admin/time-slots -H "Content-Type: application/json" -d '{"daysAhead":30}'
 *      0 3 * * 0 curl -X DELETE https://yourapp.com/api/admin/time-slots?daysOld=30
 * 
 * 3. Monitoring:
 *    - Set up alerts for performance thresholds
 *    - Monitor API response times
 *    - Track time slot utilization rates
 */
