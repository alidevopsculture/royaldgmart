'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ShoppingCart, Trash2, X } from 'lucide-react'

interface ToastData {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  icon?: React.ReactNode
}

export default function MobileToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handleMobileToast = (event: CustomEvent) => {
      const { type, message, icon } = event.detail
      const id = Date.now().toString()
      
      const newToast: ToastData = {
        id,
        type,
        message,
        icon
      }
      
      setToasts(prev => [...prev, newToast])
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 3000)
    }

    window.addEventListener('mobileToast', handleMobileToast as EventListener)
    
    return () => {
      window.removeEventListener('mobileToast', handleMobileToast as EventListener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50 space-y-2 lg:hidden">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm
            transform transition-all duration-300 animate-in slide-in-from-top-2
            ${toast.type === 'success' ? 'bg-green-500/90 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500/90 text-white' : ''}
            ${toast.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
          `}
        >
          <div className="flex-shrink-0">
            {toast.icon || (
              <>
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                {toast.type === 'info' && <ShoppingCart className="w-5 h-5" />}
              </>
            )}
          </div>
          
          <div className="flex-1 font-medium text-sm">
            {toast.message}
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}