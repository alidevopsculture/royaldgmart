'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface PopupAlertProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function PopupAlert({ message, isVisible, onClose }: PopupAlertProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 shadow-lg max-w-sm mx-auto sm:mx-0">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium text-xs sm:text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}