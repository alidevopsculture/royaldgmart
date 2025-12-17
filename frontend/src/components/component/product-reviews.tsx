'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUserData } from '@/actions/auth'

interface Review {
  _id: string
  user: {
    firstName: string
    lastName: string
    username: string
  }
  rating: number
  comment: string
  adminReply?: string
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    checkUser()
  }, [productId])

  const checkUser = async () => {
    try {
      const userData = await getUserData()
      setUser(userData)
    } catch (error) {
      console.log('User not logged in')
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to write a review')
      return
    }

    if (rating === 0 || !comment.trim()) {
      toast.error('Please provide rating and comment')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim()
        })
      })

      if (response.ok) {
        const newReview = await response.json()
        setReviews(prev => [newReview, ...prev])
        setRating(0)
        setComment('')
        setShowReviewForm(false)
        toast.success('Review submitted successfully')
        // Refresh reviews to get updated data
        setTimeout(() => fetchReviews(), 500)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${
          i < currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ))
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(Math.round(averageRating))}</div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} className="w-full">
              Write a Review
            </Button>
          )}

          {showReviewForm && (
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {renderStars(rating, true)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0 || !comment.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false)
                      setRating(0)
                      setComment('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {review.user?.firstName || review.user?.username || 'Anonymous'} {review.user?.lastName || ''}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {review.adminReply && (
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-400">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          Royal Digital Mart
                        </div>
                        <p className="text-blue-700">{review.adminReply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}