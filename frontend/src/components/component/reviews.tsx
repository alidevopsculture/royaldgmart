'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, Reply, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
  _id: string
  user: {
    firstName: string
    lastName: string
    username: string
    email: string
  }
  product: {
    _id: string
    name: string
  }
  rating: number
  comment: string
  adminReply?: string
  createdAt: string
  isDummy?: boolean
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/all`, {
        credentials: 'include'
      })
      let apiReviews = []
      if (response.ok) {
        const data = await response.json()
        apiReviews = data
      }
      
      // Add dummy reviews
      const dummyReviews = [
        {
          _id: 'dummy-1',
          user: { firstName: 'Sarah', lastName: 'Johnson', username: 'sarah_j', email: 'sarah@example.com' },
          product: { _id: 'dummy-product-1', name: 'Premium Silk Saree' },
          rating: 5,
          comment: 'Absolutely beautiful saree! The quality is exceptional and the colors are vibrant. Highly recommend!',
          adminReply: 'Thank you for your wonderful feedback! We\'re delighted you love the saree.',
          createdAt: '2024-12-20T10:30:00Z',
          isDummy: true
        },
        {
          _id: 'dummy-2', 
          user: { firstName: 'Priya', lastName: 'Sharma', username: 'priya_s', email: 'priya@example.com' },
          product: { _id: 'dummy-product-2', name: 'Designer Lehenga Set' },
          rating: 4,
          comment: 'Great quality and fast delivery. The lehenga fits perfectly and looks stunning!',
          createdAt: '2024-12-18T14:15:00Z',
          isDummy: true
        }
      ]
      
      setReviews([...dummyReviews, ...apiReviews])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminReply: replyText })
      })

      if (response.ok) {
        const updatedReview = await response.json()
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? updatedReview : review
        ))
        setReplyingTo(null)
        setReplyText('')
        toast.success('Reply added successfully')
      } else {
        toast.error('Failed to add reply')
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const handleDelete = async (reviewId: string) => {
    // Prevent deletion of dummy reviews
    const review = reviews.find(r => r._id === reviewId)
    if (review?.isDummy) {
      toast.error('Demo reviews cannot be deleted')
      return
    }
    
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setReviews(prev => prev.filter(review => review._id !== reviewId))
        toast.success('Review deleted successfully')
      } else {
        toast.error('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
            <p className="text-gray-600 mt-1">Manage customer reviews</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">{reviews.length}</div>
            <div className="text-sm text-gray-500">Total Reviews</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Admin Reply</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{review.user?.firstName || 'Unknown'} {review.user?.lastName || 'User'}</div>
                          <div className="text-sm text-gray-500">{review.user?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{review.product?.name || 'Product not found'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-1 text-sm">({review.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {review.adminReply ? (
                          <div className="max-w-xs">
                            <p className="text-sm bg-blue-50 p-2 rounded">{review.adminReply}</p>
                          </div>
                        ) : replyingTo === review._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="text-sm"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(review._id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyText('')
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No reply</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!review.adminReply && replyingTo !== review._id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(review._id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review._id)}
                            className="h-6 px-2 text-xs"
                            disabled={review.isDummy}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-gray-500">No reviews found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}