"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: number; // Changed from string to number based on DB structure
  method_type: string; // Updated field name
  name: string;
  account_number?: string; // Added based on DB structure
  account_name?: string; // Added based on DB structure
  instructions: string;
  qr_code_url?: string; // Added based on DB structure
}

interface ResubmitPaymentProps {
  bookingId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function ResubmitPaymentComponent({ 
  bookingId, 
  onSuccess,
  trigger 
}: ResubmitPaymentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");  // Keep as string for Select component
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState<string>("");
  const { toast } = useToast();

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payments/methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []); // Extract the paymentMethods array
    } catch (error) {
      console.error("Failed to load payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && paymentMethods.length === 0) {
      loadPaymentMethods();
    }
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
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, create a mock URL
    const mockUrl = URL.createObjectURL(file);
    setProofImageUrl(mockUrl);
  };

  const handleResubmit = async () => {
    if (!selectedMethod || !proofImageUrl) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method and upload payment proof",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payments/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          payment_method_id: selectedMethod, // Changed from payment_method to payment_method_id
          reference_number: referenceNumber,
          proof_image_url: proofImageUrl
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resubmit payment");
      }

      toast({
        title: "Payment Resubmitted",
        description: result.message || "Your payment proof has been resubmitted for verification",
      });

      // Reset form
      setSelectedMethod("");
      setReferenceNumber("");
      setProofImage(null);
      setProofImageUrl("");
      setOpen(false);

      // Call success callback
      onSuccess?.();

    } catch (error: any) {
      toast({
        title: "Resubmission Failed",
        description: error.message || "Failed to resubmit payment proof",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodDetails = Array.isArray(paymentMethods) 
    ? paymentMethods.find(m => m.id.toString() === selectedMethod)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Resubmit Payment Proof
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Resubmit Payment Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Payment Proof Rejected</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your previous payment proof was rejected by our admin. Please resubmit with a clear, 
                  valid payment confirmation screenshot.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(paymentMethods) && paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name} ({method.method_type.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethodDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">{selectedMethodDetails.name}</h4>
              {selectedMethodDetails.account_number && selectedMethodDetails.account_name && (
                <p className="text-sm text-blue-800 mb-2">
                  {selectedMethodDetails.account_number} - {selectedMethodDetails.account_name}
                </p>
              )}
              <p className="text-xs text-blue-700">{selectedMethodDetails.instructions}</p>
            </div>
          )}

          <div>
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              placeholder="Transaction/Reference number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="proof">Upload Payment Proof *</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*"
              onChange={handleProofUpload}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a clear screenshot of your payment confirmation (max 5MB)
            </p>
          </div>

          {proofImageUrl && (
            <div>
              <Label>Preview</Label>
              <div className="border rounded-lg p-2">
                <img
                  src={proofImageUrl}
                  alt="Payment proof preview"
                  className="max-w-full h-auto max-h-48 mx-auto rounded"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={loading || !selectedMethod || !proofImageUrl}
              className="flex-1"
            >
              {loading ? "Resubmitting..." : "Resubmit Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
