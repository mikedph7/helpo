"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewSubmissionProps {
  bookingId: number;
  serviceName: string;
  onReviewSubmitted?: () => void;
  trigger?: React.ReactNode;
}

export default function ReviewSubmissionComponent({ 
  bookingId, 
  serviceName,
  onReviewSubmitted,
  trigger 
}: ReviewSubmissionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating from 1 to 5 stars",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Comment Too Short",
        description: "Please write at least 10 characters in your review",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          rating: rating.toString(),
          comment: comment.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRating(0);
      setComment("");
      setOpen(false);
      
      onReviewSubmitted?.();

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              i < (hoverRating || rating)
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            }`}
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full flex items-center gap-2">
      <Star className="w-4 h-4" />
      Write a Review
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Review {serviceName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              How would you rate this service?
            </label>
            <div className="flex items-center gap-2">
              {renderStarRating()}
              <span className="text-sm text-gray-600 ml-2">
                {rating > 0 ? `${rating}/5 stars` : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <label htmlFor="comment" className="text-sm font-medium">
              Share your experience (minimum 10 characters)
            </label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience with this service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {comment.length}/500 characters
              </span>
              <span>
                {comment.length >= 10 ? '✓' : `${10 - comment.length} more needed`}
              </span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Review Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on the service quality and provider professionalism</li>
              <li>• Avoid personal attacks or inappropriate language</li>
              <li>• Help other customers make informed decisions</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0 || comment.trim().length < 10}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
