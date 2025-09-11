"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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
  const [step, setStep] = useState<"select" | "upload" | "success">("select");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState("");

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

    // For wallet reload, we need to go through payment verification process
    setStep("upload");
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setProofImage(file);
    
    // Create a URL for preview
    const url = URL.createObjectURL(file);
    setProofImageUrl(url);
  };

  const submitWalletReload = async () => {
    const amount = parseInt(reloadAmount) * 100; // Convert to centavos
    if (!amount || !selectedMethod || !proofImage) return;

    setLoading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('amount_cents', amount.toString());
      formData.append('payment_method_id', selectedMethod);
      formData.append('reference_number', referenceNumber);
      formData.append('memo', `Wallet reload of ₱${reloadAmount}`);
      formData.append('proof_image', proofImage);

      const response = await fetch('/api/payments/wallet-reload-request', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setStep("success");
        toast({ 
          title: "Reload Request Submitted", 
          description: "Your wallet reload request has been submitted for verification. You'll be notified once it's approved.", 
          variant: 'success' 
        });
        
        // Reset form
        setReloadAmount("");
        setSelectedMethod("");
        setReferenceNumber("");
        setProofImage(null);
        setProofImageUrl("");
        
        // Refresh wallet data
        fetchWalletData();
      } else {
        const error = await response.json();
        toast({ 
          title: "Reload failed", 
          description: error.error || "Please try again.", 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error("Reload error:", error);
      toast({ 
        title: "Reload error", 
        description: "Please try again.", 
        variant: 'destructive' 
      });
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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {step === "select" && "Add Money to Wallet"}
                    {step === "upload" && "Upload Payment Proof"}
                    {step === "success" && "Request Submitted"}
                  </DialogTitle>
                </DialogHeader>
                
                {step === "select" && (
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowReloadDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleReload}
                        disabled={loading || !reloadAmount || !selectedMethod}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {step === "upload" && (
                  <div className="space-y-4">
                    {selectedMethod && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {paymentMethods.find(m => m.id.toString() === selectedMethod)?.name}
                        </h4>
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Amount:</strong> ₱{reloadAmount}
                        </p>
                        <p className="text-sm text-blue-700">
                          {paymentMethods.find(m => m.id.toString() === selectedMethod)?.instructions}
                        </p>
                        {paymentMethods.find(m => m.id.toString() === selectedMethod)?.account_number && (
                          <p className="text-sm text-blue-800 mt-2">
                            <strong>Account:</strong> {paymentMethods.find(m => m.id.toString() === selectedMethod)?.account_number}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="reference">Reference Number (Optional)</Label>
                      <Input
                        id="reference"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Enter reference number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="proof">Upload Payment Proof *</Label>
                      <Input
                        id="proof"
                        type="file"
                        accept="image/*"
                        onChange={handleProofUpload}
                        className="mt-1"
                      />
                      {proofImageUrl && (
                        <div className="mt-2">
                          <img
                            src={proofImageUrl}
                            alt="Payment proof preview"
                            className="w-full max-w-xs h-auto rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep("select");
                          setProofImage(null);
                          setProofImageUrl("");
                          setReferenceNumber("");
                        }}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={submitWalletReload}
                        disabled={loading || !proofImage}
                        className="flex-1"
                      >
                        {loading ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </div>
                )}

                {step === "success" && (
                  <div className="text-center space-y-4 py-4">
                    <Check className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
                      <p className="text-gray-600 text-sm">
                        Your wallet reload request for ₱{reloadAmount} has been submitted for admin verification. 
                        You'll receive a notification once it's approved and the funds are added to your wallet.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowReloadDialog(false);
                        setStep("select");
                      }}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                )}
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
