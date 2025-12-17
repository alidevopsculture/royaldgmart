'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Tag, Gift } from 'lucide-react'
import { Button } from '../ui/button'

interface NotificationData {
  _id?: string
  title: string
  description: string
  image: string
  offerText: string
  buttonText: string
  buttonLink: string
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export default function NotificationPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [notification, setNotification] = useState<NotificationData | null>(null)

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://www.royaldgmart.com'}/api/notifications`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.isActive) {
            const currentNotificationId = notification?._id
            const newNotificationId = data._id
            
            setNotification(data)
            
            // Show notification if:
            // 1. It's a new notification (different ID)
            // 2. Or if no notification was shown today
            // 3. Or if notification was updated (same ID but different content)
            const lastShownId = localStorage.getItem('lastNotificationId')
            const lastShown = localStorage.getItem('notificationLastShown')
            const today = new Date().toDateString()
            
            const shouldShow = (
              newNotificationId !== lastShownId || // New notification
              lastShown !== today || // Not shown today
              (currentNotificationId && currentNotificationId !== newNotificationId) || // Updated notification
              !lastShownId // Force show if no previous record
            )
            
            if (shouldShow) {
              setTimeout(() => setIsVisible(true), window.innerWidth < 768 ? 1000 : 2000);
            }
          } else {
            // If notification is inactive, hide it
            setIsVisible(false)
            setNotification(null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch notification:', error)
      }
    }

    fetchNotification()
    
    // Poll for updates every 10 seconds for faster admin updates
    const interval = setInterval(fetchNotification, 10000)
    
    // Listen for manual refresh events (can be triggered from admin panel)
    const handleRefreshNotification = () => {
      // Clear localStorage to force show updated notification
      localStorage.removeItem('notificationLastShown')
      localStorage.removeItem('lastNotificationId')
      fetchNotification()
    }
    
    window.addEventListener('refreshNotification', handleRefreshNotification)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('refreshNotification', handleRefreshNotification)
    }
  }, [notification?._id])

  const handleClose = () => {
    setIsVisible(false)
    // Store both the date and notification ID
    localStorage.setItem('notificationLastShown', new Date().toDateString())
    if (notification?._id) {
      localStorage.setItem('lastNotificationId', notification._id)
    }
  }

  const handleShopNow = () => {
    window.location.href = notification?.buttonLink || '/'
    handleClose()
  }

  // Debug logs - simplified
  const shouldShow = notification && notification.isActive && isVisible;
  
  // Don't show if conditions not met
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative max-w-sm w-full mx-4 bg-gradient-to-br ${notification.backgroundColor} rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-500`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        </div>

        {/* Content */}
        <div className="relative p-4 md:p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-xl md:text-2xl font-bold mb-3 ${notification.textColor}`}>
            {notification.title}
          </h2>

          {/* Description */}
          <p className={`text-base md:text-lg mb-4 md:mb-6 ${notification.textColor} opacity-90`}>
            {notification.description}
          </p>

          {/* Offer Code */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Tag className="w-4 h-4 text-white" />
              <span className="text-white font-bold tracking-wider">
                {notification.offerText}
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden">
            <img
              src={notification.image}
              alt="Offer"
              className="w-full h-24 md:h-32 object-cover"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleShopNow}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Gift className="w-4 h-4 mr-2" />
              {notification.buttonText}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 sm:flex-none sm:min-w-[100px] px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-xl font-semibold"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}