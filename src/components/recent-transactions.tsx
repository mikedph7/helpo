'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  Settings2, 
  Clock,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletTransaction {
  id: number;
  amount: number;
  transaction_type: 'reload' | 'payment' | 'refund' | 'admin_adjustment';
  description: string;
  reference_id?: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

interface RecentTransactionsProps {
  userId: number;
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount / 100);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'reload':
      return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
    case 'payment':
      return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    case 'refund':
      return <RefreshCcw className="w-4 h-4 text-orange-600" />;
    case 'admin_adjustment':
      return <Settings2 className="w-4 h-4 text-purple-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'reload':
      return 'text-green-600';
    case 'payment':
      return 'text-blue-600';
    case 'refund':
      return 'text-orange-600';
    case 'admin_adjustment':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};

const getTransactionSign = (type: string) => {
  switch (type) {
    case 'reload':
    case 'refund':
      return '+';
    case 'payment':
      return '-';
    case 'admin_adjustment':
      return ''; // Could be + or - depending on amount
    default:
      return '';
  }
};

export default function RecentTransactions({ userId }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const limit = showAll ? 20 : 5;
      const response = await fetch(`/api/payments/wallet/${userId}/transactions?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Your wallet activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, showAll ? transactions.length : 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(transaction.created_at)}</span>
                      {transaction.reference_id && (
                        <>
                          <span>•</span>
                          <span>Ref: {transaction.reference_id.slice(0, 8)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${getTransactionColor(transaction.transaction_type)}`}>
                    {getTransactionSign(transaction.transaction_type)}
                    {formatAmount(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500">
                    Balance: {formatAmount(transaction.balance_after)}
                  </p>
                </div>
              </div>
            ))}
            
            {transactions.length > 5 && (
              <div className="pt-3 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {showAll ? (
                    <>Show Less</>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View All Transactions ({transactions.length})
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
