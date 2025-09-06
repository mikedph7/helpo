"use client";

import { useState, useEffect } from "react";
import { CreditCard, Wallet, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PaymentMethod {
  id: number;
  method_type: string;
  name: string;
  account_number?: string;
  account_name?: string;
  qr_code_url?: string;
  instructions?: string;
}

interface PaymentComponentProps {
  bookingId?: number | null;
  amount: number;
  userId?: number;
  userWalletBalance?: number;
  service?: {
    auto_confirm?: boolean;
    name?: string;
  };
  onPaymentSuccess: (paymentInfo?: {
    method: 'wallet' | 'manual';
    paymentMethod?: string;
    referenceNumber?: string;
    proofImageUrl?: string;
  }) => void;
  onPaymentCancel?: () => void;
}

export default function PaymentComponent({
  bookingId,
  amount,
  userId = 1, // Default user ID for testing
  userWalletBalance = 0,
  service,
  onPaymentSuccess,
  onPaymentCancel
}: PaymentComponentProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "upload" | "success">("select");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payments/methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handleWalletPayment = async () => {
    if (userWalletBalance < amount) {
      toast({
        title: "Insufficient wallet balance",
        description: "Please choose another method or reload your wallet.",
        variant: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      if (bookingId) {
        // Existing booking - process payment immediately
        const response = await fetch("/api/payments/wallet-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: bookingId, amount_cents: amount * 100 }),
        });

        if (response.ok) {
          setStep("success");
          onPaymentSuccess({ method: 'manual' });
        } else {
          const error = await response.json();
          toast({
            title: "Payment failed",
            description: error.error || "Please try again.",
            variant: 'destructive',
          });
        }
      } else {
        // New booking - just confirm payment method selection
        // Actual payment will be processed after booking creation
        setStep("success");
        onPaymentSuccess({ method: 'wallet' });
      }
    } catch (error) {
  console.error("Wallet payment error:", error);
  toast({ title: "Payment failed", description: "Please try again.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = () => {
    const method = paymentMethods.find((m) => m.id.toString() === selectedMethod);
    if (!method) return;
    setStep("upload");
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofImage(file);
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, create a mock URL
    const mockUrl = URL.createObjectURL(file);
    setProofImageUrl(mockUrl);
  };

    const handleSubmitProof = async () => {
    // Reference number is optional; require proof image and selected method only
    if (!proofImageUrl || !selectedMethod) {
  toast({ title: "Upload required", description: "Please upload payment proof.", variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (bookingId) {
        // Existing booking - submit payment proof
        const response = await fetch("/api/payments/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_method: paymentMethods.find((m) => m.id.toString() === selectedMethod)?.method_type,
            reference_number: referenceNumber,
            proof_image_url: proofImageUrl,
            amount,
          }),
        });

        if (response.ok) {
          setStep("success");
          onPaymentSuccess({ method: 'wallet' });
        } else {
          const error = await response.json();
          toast({
            title: "Submission failed",
            description: error.error || "Failed to submit payment proof",
            variant: 'destructive',
          });
        }
      } else {
        // New booking - store payment info and proceed to booking creation
        const selectedPaymentMethod = paymentMethods.find((m) => m.id.toString() === selectedMethod);
        setStep("success");
        onPaymentSuccess({ 
          method: 'manual',
          paymentMethod: selectedPaymentMethod?.method_type,
          referenceNumber: referenceNumber,
          proofImageUrl: proofImageUrl
        });
      }
    } catch (error) {
  console.error("Payment submission error:", error);
  toast({ title: "Submission error", description: "Failed to submit payment proof", variant: 'destructive' });
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

  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Submitted!</h3>
            <p className="text-gray-600">
              {selectedMethod === "wallet"
                ? "Payment completed successfully."
                : "Your payment proof has been submitted and is pending verification."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "upload") {
    const method = paymentMethods.find((m) => m.id.toString() === selectedMethod);
    
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Submit Payment Proof</CardTitle>
          <p className="text-sm text-gray-600">
            Total Amount: <strong>{formatAmount(amount)}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {method && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{method.name}</h4>
              {method.account_number && (
                <p className="text-sm mb-1">
                  <strong>Account:</strong> {method.account_number}
                </p>
              )}
              {method.account_name && (
                <p className="text-sm mb-2">
                  <strong>Name:</strong> {method.account_name}
                </p>
              )}
              {method.instructions && (
                <p className="text-sm text-gray-700">{method.instructions}</p>
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
              required
            />
            {proofImageUrl && (
              <img
                src={proofImageUrl}
                alt="Payment proof"
                className="mt-2 max-w-xs h-auto rounded-lg"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("select")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitProof}
              disabled={loading || !proofImageUrl}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
        <p className="text-sm text-gray-600">
          Total Amount: <strong>{formatAmount(amount)}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approval Disclaimer for non-auto-confirm services */}
        {service && service.auto_confirm === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Provider Approval Required</p>
                <p>
                  This booking will need to be approved by the provider before confirmation. 
                  If the provider cancels, your payment will be automatically refunded to your wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {/* Wallet Payment Option */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Pay from Wallet</p>
                  <p className="text-sm text-gray-600">
                    Balance: {formatAmount(userWalletBalance)}
                  </p>
                </div>
              </div>
            </Label>
            {userWalletBalance < amount && (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>

          {/* Manual Payment Methods */}
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value={method.id.toString()} id={method.id.toString()} />
              <Label htmlFor={method.id.toString()} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-600">
                      {method.method_type === "gcash" ? "GCash Payment" : "Bank Transfer"}
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-4 space-y-3">
          {selectedMethod === "wallet" ? (
            <>
              <Button
                onClick={handleWalletPayment}
                disabled={loading || userWalletBalance < amount}
                className="w-full"
              >
                {loading ? "Processing..." : "Pay with Wallet"}
              </Button>
              {onPaymentCancel && (
                <Button 
                  variant="outline" 
                  onClick={onPaymentCancel} 
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </>
          ) : selectedMethod ? (
            <>
              <Button onClick={handleManualPayment} className="w-full">
                Proceed to Payment
              </Button>
              {onPaymentCancel && (
                <Button 
                  variant="outline" 
                  onClick={onPaymentCancel} 
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <>
              <Button disabled className="w-full">
                Select Payment Method
              </Button>
              {onPaymentCancel && (
                <Button 
                  variant="outline" 
                  onClick={onPaymentCancel} 
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
