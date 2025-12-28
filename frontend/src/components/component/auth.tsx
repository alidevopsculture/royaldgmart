"use client"

import { useState, useEffect } from "react"
import { Sparkles, Eye, EyeOff, Mail } from "lucide-react"
import { signIn, signUp, sendOTP } from "@/actions/auth"
import { forgotPassword, resetPassword } from "@/actions/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { forceRefreshAfterAuth } from "@/lib/cache-utils"
import PopupAlert from "../functional/PopupAlert"

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [resetOtpSent, setResetOtpSent] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const redirectTo = searchParams.get('redirect')
  const message = searchParams.get('message')
  
  useEffect(() => {
    if (message === 'login-required') {
      toast.error('Please login to proceed to checkout')
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const otp = formData.get('otp') as string
    const newPassword = formData.get('newPassword') as string
    
    try {
      if (isForgotPassword) {
        if (!resetOtpSent) {
          toast.error('Please request OTP first')
          return
        }
        const result = await resetPassword(email, otp, newPassword)
        if (result === 'Password reset successfully!') {
          toast.success('Password reset successfully!')
          setIsForgotPassword(false)
          setResetOtpSent(false)
        } else {
          setAlertMessage(result)
          setShowAlert(true)
        }
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        if (!otpSent) {
          toast.error('Please verify your email first')
          return
        }
        const result = await signUp({ username, email, password, confirmPassword, otp })
        if (result === 'Signup successfully!') {
          toast.success('Account created successfully!')
          forceRefreshAfterAuth()
          if (redirectTo === 'checkout') {
            window.location.href = '/checkout'
          } else if (redirectTo === 'wholesale-checkout') {
            window.location.href = '/wholesale-checkout'
          } else {
            window.location.href = '/'
          }
        } else {
          setAlertMessage(result || 'Signup failed. Please try again.')
          setShowAlert(true)
        }
      } else {
        const result = await signIn({ email, password })
        if (result === 'Login successfully!') {
          toast.success('Welcome back!')
          forceRefreshAfterAuth()
          if (redirectTo === 'checkout') {
            window.location.href = '/checkout'
          } else if (redirectTo === 'wholesale-checkout') {
            window.location.href = '/wholesale-checkout'
          } else {
            window.location.href = '/'
          }
        } else {
          setAlertMessage(result)
          setShowAlert(true)
        }
      }
    } catch (error) {
      setAlertMessage('Something went wrong. Please try again.')
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResetOTP = async () => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value
    if (!email) {
      toast.error('Please enter your email first')
      return
    }
    
    setOtpLoading(true)
    try {
      const result = await forgotPassword(email)
      if (result === 'OTP sent to your email') {
        toast.success('Reset OTP sent to your email!')
        setResetOtpSent(true)
      } else {
        setAlertMessage(result)
        setShowAlert(true)
      }
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to send OTP')
      setShowAlert(true)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSendOTP = async () => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value
    if (!email) {
      toast.error('Please enter your email first')
      return
    }
    
    setOtpLoading(true)
    try {
      const result = await sendOTP(email)
      if (result === 'OTP sent successfully') {
        toast.success('OTP sent to your email!')
        setOtpSent(true)
      } else {
        setAlertMessage(result)
        setShowAlert(true)
      }
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to send OTP')
      setShowAlert(true)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <>
      <PopupAlert 
        message={alertMessage}
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgb(147, 61, 22) 0%, rgb(180, 83, 9) 50%, rgb(217, 119, 6) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full opacity-20 animate-pulse delay-1000" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-15 animate-pulse delay-500" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/80">
                  {isForgotPassword ? "Enter your email to reset password" : isSignUp ? "Join our royal community" : "Sign in to continue your journey"}
                </p>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {isSignUp && (
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
              </div>
              
              {!isForgotPassword && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              )}
              
              {isSignUp && (
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                  />
                </div>
              )}
              
              {isForgotPassword && (
                <>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                        className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                      />
                      <button
                        type="button"
                        onClick={handleSendResetOTP}
                        disabled={otpLoading || resetOtpSent}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm bg-indigo-100 text-indigo-700 rounded-lg sm:rounded-xl hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {otpLoading ? 'Sending...' : resetOtpSent ? 'Sent' : 'Send OTP'}
                      </button>
                    </div>
                    {resetOtpSent && (
                      <p className="text-sm text-green-600">✓ OTP sent to your email. Check your inbox!</p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="New Password"
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 placeholder-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </>
              )}
              
              {isSignUp && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                      className="w-full sm:flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-900 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || otpSent}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm bg-indigo-100 text-indigo-700 rounded-lg sm:rounded-xl hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="text-sm text-green-600">✓ OTP sent to your email. Check your inbox!</p>
                  )}
                </div>
              )}
              
              {!isSignUp && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-white/90 hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                {loading ? 'Please wait...' : isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            
            {/* Toggle */}
            <div className="text-center">
              {isForgotPassword ? (
                <button
                  type="button"
                  className="font-semibold text-white/90 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setResetOtpSent(false)
                  }}
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  <span className="text-white/80 text-xs sm:text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    className="ml-2 font-semibold text-white/90 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}