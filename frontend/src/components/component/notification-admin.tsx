'use client'

import { useState, useEffect } from 'react'
import { saveNotification, getNotification, NotificationData } from '@/actions/notifications'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Eye, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationAdmin() {
  const [notification, setNotification] = useState<NotificationData>({
    title: '🎉 MEGA SALE ALERT!',
    description: 'Get up to 70% OFF on premium collections. Limited time offer!',
    image: 'https://images.pexels.com/photos/1676059/pexels-photo-1676059.jpeg',
    offerText: 'SAVE70',
    buttonText: 'Shop Now',
    buttonLink: '/collections/sale',
    isActive: true,
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white'
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const data = await getNotification()
        if (data) {
          setNotification(data)
        }
      } catch (error) {
        console.error('Failed to load notification:', error)
      }
    }
    loadNotification()
  }, [])

  const [showPreview, setShowPreview] = useState(false)

  const backgroundOptions = [
    { value: 'from-purple-600 to-pink-600', label: 'Purple to Pink' },
    { value: 'from-blue-600 to-indigo-600', label: 'Blue to Indigo' },
    { value: 'from-green-600 to-teal-600', label: 'Green to Teal' },
    { value: 'from-orange-600 to-red-600', label: 'Orange to Red' },
    { value: 'from-gray-800 to-black', label: 'Gray to Black' },
  ]

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveNotification(notification)
      toast.success('Notification saved successfully!')
      
      // Trigger immediate refresh of notification popup
      window.dispatchEvent(new CustomEvent('refreshNotification'))
    } catch (error) {
      toast.error('Failed to save notification')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"></div>
            Notification Popup Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-medium">Notification Status</Label>
              <p className="text-sm text-gray-600">Enable or disable the popup notification</p>
            </div>
            <Checkbox
              checked={notification.isActive}
              onCheckedChange={(checked) => 
                setNotification(prev => ({ ...prev, isActive: !!checked }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={notification.description}
                  onChange={(e) => setNotification(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter notification description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="offerText">Offer Code</Label>
                <Input
                  id="offerText"
                  value={notification.offerText}
                  onChange={(e) => setNotification(prev => ({ ...prev, offerText: e.target.value }))}
                  placeholder="e.g., SAVE70"
                />
              </div>

              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={notification.buttonText}
                  onChange={(e) => setNotification(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="e.g., Shop Now"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={notification.image}
                  onChange={(e) => setNotification(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <Label htmlFor="buttonLink">Button Link</Label>
                <Input
                  id="buttonLink"
                  value={notification.buttonLink}
                  onChange={(e) => setNotification(prev => ({ ...prev, buttonLink: e.target.value }))}
                  placeholder="e.g., /collections/sale"
                />
              </div>

              <div>
                <Label>Background Theme</Label>
                <Select
                  value={notification.backgroundColor}
                  onValueChange={(value) => setNotification(prev => ({ ...prev, backgroundColor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 bg-gradient-to-r ${option.value} rounded`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Preview */}
              {notification.image && (
                <div>
                  <Label>Image Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={notification.image}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Notification'}
            </Button>
            <Button onClick={handlePreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={() => {
                // Force refresh notification popup
                window.dispatchEvent(new CustomEvent('refreshNotification'))
                toast.success('Notification refresh triggered!')
              }} 
              variant="secondary"
            >
              Test Show
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative max-w-md w-full bg-gradient-to-br ${notification.backgroundColor} rounded-3xl shadow-2xl overflow-hidden`}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              ✕
            </button>

            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  ✨
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white">
                {notification.title}
              </h2>

              <p className="text-lg mb-6 text-white opacity-90">
                {notification.description}
              </p>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white font-bold tracking-wider">
                    {notification.offerText}
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-2xl overflow-hidden">
                <img
                  src={notification.image}
                  alt="Offer"
                  className="w-full h-32 object-cover"
                />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 rounded-xl">
                  {notification.buttonText}
                </Button>
                <Button
                  variant="outline"
                  className="px-6 border-white/30 text-white hover:bg-white/10 rounded-xl"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}