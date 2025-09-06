// New comprehensive status system types and mappings

/**
 * WORKFLOW OVERVIEW:
 * 
 * 1. CUSTOMER: Creates booking + submits payment proof
 *    → BookingStatus: awaiting_payment_verification
 *    → PaymentStatus: proof_submitted
 * 
 * 2. ADMIN: Reviews and verifies payment proof
 *    → If payment approved:
 *      - PaymentStatus: verified
 *      - If service.auto_confirm = true → BookingStatus: confirmed
 *      - If service.auto_confirm = false → BookingStatus: pending_provider
 *    → If payment rejected:
 *      - PaymentStatus: rejected
 *      - BookingStatus: remains awaiting_payment_verification
 * 
 * 3. PROVIDER: Reviews booking (only if auto_confirm = false)
 *    → Accept → BookingStatus: confirmed
 *    → Decline → BookingStatus: cancelled_by_provider (triggers refund)
 * 
 * 4. SERVICE DELIVERY:
 *    → Provider marks as complete → BookingStatus: completed
 *    → Various cancellation scenarios handled
 * 
 * ROLE RESPONSIBILITIES:
 * - ADMIN: Payment verification only
 * - PROVIDER: Booking approval (if auto_confirm=false) + service delivery
 * - CUSTOMER: Booking creation + payment proof submission
 */

export enum NewBookingStatus {
  AWAITING_PAYMENT_VERIFICATION = 'awaiting_payment_verification',
  PENDING_PROVIDER = 'pending_provider',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED_BY_PROVIDER = 'cancelled_by_provider',
  CANCELLED_BY_CUSTOMER = 'cancelled_by_customer',
  CANCELLED_BY_ADMIN = 'cancelled_by_admin',
  EXPIRED = 'expired'
}

export enum NewPaymentStatus {
  NONE = 'none',
  PROOF_SUBMITTED = 'proof_submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// Mapping from new statuses to current database enum values
export const BookingStatusMapping = {
  [NewBookingStatus.AWAITING_PAYMENT_VERIFICATION]: 'pending',
  [NewBookingStatus.PENDING_PROVIDER]: 'pending', 
  [NewBookingStatus.CONFIRMED]: 'confirmed',
  [NewBookingStatus.COMPLETED]: 'completed',
  [NewBookingStatus.CANCELLED_BY_PROVIDER]: 'canceled',
  [NewBookingStatus.CANCELLED_BY_CUSTOMER]: 'canceled',
  [NewBookingStatus.CANCELLED_BY_ADMIN]: 'canceled',
  [NewBookingStatus.EXPIRED]: 'canceled'
} as const;

export const PaymentStatusMapping = {
  [NewPaymentStatus.NONE]: 'unpaid',
  [NewPaymentStatus.PROOF_SUBMITTED]: 'pending',
  [NewPaymentStatus.UNDER_REVIEW]: 'pending',
  [NewPaymentStatus.VERIFIED]: 'paid',
  [NewPaymentStatus.REJECTED]: 'failed',
  [NewPaymentStatus.REFUNDED]: 'refunded',
  [NewPaymentStatus.PARTIALLY_REFUNDED]: 'refunded'
} as const;

// Reverse mapping from database enum to new status
export const BookingStatusReverseMapping = {
  'pending': [NewBookingStatus.AWAITING_PAYMENT_VERIFICATION, NewBookingStatus.PENDING_PROVIDER],
  'confirmed': [NewBookingStatus.CONFIRMED],
  'completed': [NewBookingStatus.COMPLETED],
  'canceled': [NewBookingStatus.CANCELLED_BY_PROVIDER, NewBookingStatus.CANCELLED_BY_CUSTOMER, NewBookingStatus.CANCELLED_BY_ADMIN, NewBookingStatus.EXPIRED]
} as const;

export const PaymentStatusReverseMapping = {
  'unpaid': [NewPaymentStatus.NONE],
  'pending': [NewPaymentStatus.PROOF_SUBMITTED, NewPaymentStatus.UNDER_REVIEW],
  'paid': [NewPaymentStatus.VERIFIED],
  'failed': [NewPaymentStatus.REJECTED],
  'refunded': [NewPaymentStatus.REFUNDED, NewPaymentStatus.PARTIALLY_REFUNDED]
} as const;

// Status transition logic
export interface BookingStatusTransition {
  from: NewBookingStatus;
  to: NewBookingStatus;
  trigger: 'admin_verify_payment' | 'admin_reject_payment' | 'provider_accept' | 'provider_decline' | 'complete_service' | 'customer_cancel' | 'provider_cancel' | 'admin_cancel' | 'expire';
  conditions?: {
    auto_confirm?: boolean;
    payment_verified?: boolean;
  };
  actor: 'admin' | 'provider' | 'customer' | 'system';
}

export const BOOKING_STATUS_TRANSITIONS: BookingStatusTransition[] = [
  // Admin payment verification (Admin responsibility)
  {
    from: NewBookingStatus.AWAITING_PAYMENT_VERIFICATION,
    to: NewBookingStatus.CONFIRMED,
    trigger: 'admin_verify_payment',
    conditions: { auto_confirm: true },
    actor: 'admin'
  },
  {
    from: NewBookingStatus.AWAITING_PAYMENT_VERIFICATION,
    to: NewBookingStatus.PENDING_PROVIDER,
    trigger: 'admin_verify_payment',
    conditions: { auto_confirm: false },
    actor: 'admin'
  },
  
  // Provider booking decisions (Provider responsibility - only when auto_confirm = false)
  {
    from: NewBookingStatus.PENDING_PROVIDER,
    to: NewBookingStatus.CONFIRMED,
    trigger: 'provider_accept',
    actor: 'provider'
  },
  {
    from: NewBookingStatus.PENDING_PROVIDER,
    to: NewBookingStatus.CANCELLED_BY_PROVIDER,
    trigger: 'provider_decline',
    actor: 'provider'
  },
  
  // Service completion (Provider responsibility)
  {
    from: NewBookingStatus.CONFIRMED,
    to: NewBookingStatus.COMPLETED,
    trigger: 'complete_service',
    actor: 'provider'
  },
  
  // Cancellations (Various actors)
  {
    from: NewBookingStatus.CONFIRMED,
    to: NewBookingStatus.CANCELLED_BY_CUSTOMER,
    trigger: 'customer_cancel',
    actor: 'customer'
  },
  {
    from: NewBookingStatus.CONFIRMED,
    to: NewBookingStatus.CANCELLED_BY_PROVIDER,
    trigger: 'provider_cancel',
    actor: 'provider'
  },
  {
    from: NewBookingStatus.AWAITING_PAYMENT_VERIFICATION,
    to: NewBookingStatus.EXPIRED,
    trigger: 'expire',
    actor: 'system'
  },
  {
    from: NewBookingStatus.PENDING_PROVIDER,
    to: NewBookingStatus.CANCELLED_BY_ADMIN,
    trigger: 'admin_cancel',
    actor: 'admin'
  }
];

// Helper functions
export function getNewBookingStatus(dbStatus: string, paymentStatus?: string, serviceAutoConfirm?: boolean): NewBookingStatus {
  // Determine the actual new status based on context
  switch (dbStatus) {
    case 'pending':
      // Need to determine if it's awaiting payment verification or provider approval
      if (paymentStatus === 'pending') {
        return NewBookingStatus.AWAITING_PAYMENT_VERIFICATION;
      } else if (paymentStatus === 'paid' && !serviceAutoConfirm) {
        return NewBookingStatus.PENDING_PROVIDER;
      }
      return NewBookingStatus.AWAITING_PAYMENT_VERIFICATION;
    
    case 'confirmed':
      return NewBookingStatus.CONFIRMED;
    
    case 'completed':
      return NewBookingStatus.COMPLETED;
    
    case 'canceled':
      // Would need additional context to determine who cancelled
      return NewBookingStatus.CANCELLED_BY_CUSTOMER; // Default assumption
    
    default:
      return NewBookingStatus.AWAITING_PAYMENT_VERIFICATION;
  }
}

export function getNewPaymentStatus(dbStatus: string): NewPaymentStatus {
  switch (dbStatus) {
    case 'unpaid':
      return NewPaymentStatus.NONE;
    case 'pending':
      return NewPaymentStatus.PROOF_SUBMITTED; // Default assumption
    case 'paid':
      return NewPaymentStatus.VERIFIED;
    case 'failed':
      return NewPaymentStatus.REJECTED;
    case 'refunded':
      return NewPaymentStatus.REFUNDED;
    default:
      return NewPaymentStatus.NONE;
  }
}

// Status display configurations
export const BookingStatusConfig = {
  [NewBookingStatus.AWAITING_PAYMENT_VERIFICATION]: {
    label: 'Awaiting Payment Verification',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'We are verifying your payment proof',
    icon: '⏳'
  },
  [NewBookingStatus.PENDING_PROVIDER]: {
    label: 'Pending Provider Approval',
    color: 'bg-blue-100 text-blue-800',
    description: 'Waiting for provider to confirm your booking',
    icon: '👨‍💼'
  },
  [NewBookingStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    description: 'Your booking is confirmed',
    icon: '✅'
  },
  [NewBookingStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    description: 'Service has been completed',
    icon: '🎉'
  },
  [NewBookingStatus.CANCELLED_BY_PROVIDER]: {
    label: 'Cancelled by Provider',
    color: 'bg-red-100 text-red-800',
    description: 'Provider cancelled this booking',
    icon: '❌'
  },
  [NewBookingStatus.CANCELLED_BY_CUSTOMER]: {
    label: 'Cancelled by You',
    color: 'bg-red-100 text-red-800',
    description: 'You cancelled this booking',
    icon: '❌'
  },
  [NewBookingStatus.CANCELLED_BY_ADMIN]: {
    label: 'Cancelled by Admin',
    color: 'bg-red-100 text-red-800',
    description: 'This booking was cancelled by admin',
    icon: '⚠️'
  },
  [NewBookingStatus.EXPIRED]: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-800',
    description: 'Booking expired due to payment verification timeout',
    icon: '⏰'
  }
};

export const PaymentStatusConfig = {
  [NewPaymentStatus.NONE]: {
    label: 'No Payment',
    color: 'bg-gray-100 text-gray-800',
    description: 'No payment required yet',
    icon: '⚪'
  },
  [NewPaymentStatus.PROOF_SUBMITTED]: {
    label: 'Proof Submitted',
    color: 'bg-blue-100 text-blue-800',
    description: 'Payment proof has been submitted',
    icon: '📤'
  },
  [NewPaymentStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Admin is reviewing your payment proof',
    icon: '👀'
  },
  [NewPaymentStatus.VERIFIED]: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800',
    description: 'Payment has been verified and received',
    icon: '✅'
  },
  [NewPaymentStatus.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Payment proof was rejected - please resubmit',
    icon: '❌'
  },
  [NewPaymentStatus.REFUNDED]: {
    label: 'Refunded',
    color: 'bg-purple-100 text-purple-800',
    description: 'Full refund has been processed',
    icon: '💰'
  },
  [NewPaymentStatus.PARTIALLY_REFUNDED]: {
    label: 'Partially Refunded',
    color: 'bg-purple-100 text-purple-800',
    description: 'Partial refund has been processed',
    icon: '💸'
  }
};

// Utility function to get status configuration
export function getStatusConfig(type: 'booking', status: NewBookingStatus): typeof BookingStatusConfig[NewBookingStatus];
export function getStatusConfig(type: 'payment', status: NewPaymentStatus): typeof PaymentStatusConfig[NewPaymentStatus]; 
export function getStatusConfig(type: 'booking' | 'payment', status: string): any {
  if (type === 'booking') {
    return BookingStatusConfig[status as NewBookingStatus] || BookingStatusConfig[NewBookingStatus.AWAITING_PAYMENT_VERIFICATION];
  } else {
    return PaymentStatusConfig[status as NewPaymentStatus] || PaymentStatusConfig[NewPaymentStatus.NONE];
  }
}
