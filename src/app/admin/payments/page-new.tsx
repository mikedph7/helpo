'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getStatusConfig, NewPaymentStatus, NewBookingStatus } from '@/lib/status-system';
import { Eye, Check, X, Calendar, MapPin, User, Phone, Mail, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  payment_proof_url?: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  booking?: {
    id: number;
    scheduled_at: string;
    location?: string;
    notes?: string;
    status: string;
    total_price: number;
    created_at: string;
    service: {
      id: number;
      name: string;
      description?: string;
      auto_confirm: boolean;
      duration_minutes?: number;
      category?: string;
    };
    provider: {
      id: number;
      name: string;
      photo_url?: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
    setProcessingId(paymentId);
    
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          admin_notes: adminNotes
        })
      });

      if (!response.ok) throw new Error('Failed to process payment');

      toast({
        title: 'Success',
        description: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      // Remove processed payment from list
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      setAdminNotes('');
      setShowModal(false);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setAdminNotes('');
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `₱${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <Badge variant="secondary" className="text-sm">
          {payments.length} pending payments
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending payments to review
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-sm text-gray-500">{payment.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>
                      {payment.booking ? (
                        <div>
                          <div className="font-medium">{payment.booking.service.name}</div>
                          <div className="text-sm text-gray-500">{payment.booking.provider.name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Wallet Reload</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === 'pending' ? 'secondary' : 'default'}
                        className={getStatusConfig('payment', payment.status as NewPaymentStatus).color}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(payment)}
                        className="mr-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Review Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Review - #{selectedPayment?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-lg">{formatAmount(selectedPayment.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedPayment.method}</Badge>
                      <Badge className={getStatusConfig('payment', selectedPayment.status as NewPaymentStatus).color}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium">{formatDate(selectedPayment.created_at)}</p>
                    </div>
                  </div>
                  
                  {selectedPayment.payment_proof_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Payment Proof</p>
                      <Image
                        src={selectedPayment.payment_proof_url}
                        alt="Payment proof"
                        width={300}
                        height={200}
                        className="rounded-lg border cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(selectedPayment.payment_proof_url, '_blank')}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedPayment.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedPayment.user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Information (if applicable) */}
              {selectedPayment.booking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-semibold">{selectedPayment.booking.service.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{selectedPayment.booking.service.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Provider</p>
                        <p className="font-medium">{selectedPayment.booking.provider.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Scheduled</p>
                          <p className="font-medium">{formatDate(selectedPayment.booking.scheduled_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedPayment.booking.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-medium">{selectedPayment.booking.location}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Booking Status</p>
                        <Badge className={getStatusConfig('booking', selectedPayment.booking.status as NewBookingStatus).color}>
                          {selectedPayment.booking.status}
                        </Badge>
                      </div>
                      {selectedPayment.booking.notes && (
                        <div>
                          <p className="text-sm text-gray-600">Customer Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{selectedPayment.booking.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add notes about this payment verification..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={processingId === selectedPayment.id}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePaymentAction(selectedPayment.id, 'reject')}
                  disabled={processingId === selectedPayment.id}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {processingId === selectedPayment.id ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handlePaymentAction(selectedPayment.id, 'approve')}
                  disabled={processingId === selectedPayment.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {processingId === selectedPayment.id ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
