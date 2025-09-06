"use client";

import { useState, useEffect } from "react";
import { Star, User, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    id: number;
    name: string | null;
    avatar: string | null;
  };
  service: {
    id: number;
    name: string | null;
  };
}

interface ReviewsDisplayProps {
  serviceId: number;
  serviceName: string;
  showTitle?: boolean;
  maxReviews?: number;
}

export default function ReviewsDisplay({ 
  serviceId, 
  serviceName, 
  showTitle = true,
  maxReviews = 5 
}: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [serviceId, showAll]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const limit = showAll ? 50 : maxReviews;
      const response = await fetch(`/api/reviews?service_id=${serviceId}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No reviews yet for this service.</p>
        <p className="text-sm text-gray-400">Be the first to share your experience!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} out of 5 ({total} review{total !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {review.user.name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {review.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More/Less Button */}
      {total > maxReviews && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="text-sm"
          >
            {showAll ? `Show Less` : `View All ${total} Reviews`}
          </Button>
        </div>
      )}
    </div>
  );
}
