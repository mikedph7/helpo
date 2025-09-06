"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WalletTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface PaymentMethod {
  id: number;
  method_type: string;
  name: string;
  account_number?: string;
  account_name?: string;
  instructions?: string;
}

interface WalletComponentProps {
  userId: number;
  initialBalance?: number;
}

export default function WalletComponent({ userId, initialBalance = 0 }: WalletComponentProps) {
  const { toast } = useToast();
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [reloadAmount, setReloadAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchPaymentMethods();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch(`/api/payments/wallet/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance?.available_cents || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payments/methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handleReload = async () => {
    const amount = parseInt(reloadAmount) * 100; // Convert to centavos
    if (!amount || amount <= 0 || !selectedMethod) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/payments/wallet/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: amount,
          memo: `Wallet reload of ₱${reloadAmount}`,
          reference_id: `reload_${Date.now()}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
  setBalance(data.new_balance?.available_cents || 0);
  toast({ title: "Wallet reloaded", description: "Your wallet has been updated.", variant: 'success' });
        setShowReloadDialog(false);
        setReloadAmount("");
        setSelectedMethod("");
        fetchWalletData(); // Refresh data
      } else {
  const error = await response.json();
  toast({ title: "Reload failed", description: error.error || "Please try again.", variant: 'destructive' });
      }
    } catch (error) {
  console.error("Reload error:", error);
  toast({ title: "Reload error", description: "Please try again.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(balance)}
              </p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
            <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (PHP)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={reloadAmount}
                      onChange={(e) => setReloadAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="50"
                      max="50000"
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.id.toString()} id={method.id.toString()} />
                          <Label htmlFor={method.id.toString()}>
                            {method.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleReload}
                    disabled={loading || !reloadAmount || !selectedMethod}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${getTransactionColor(transaction.amount)}`}>
                    <p className="font-medium">
                      {transaction.amount > 0 ? "+" : ""}
                      {formatAmount(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
