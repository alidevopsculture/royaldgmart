"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SubmitHandler, useForm } from "react-hook-form"
import { signInType } from "@/types/auth"
import toast from "react-hot-toast"
import { signIn } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react"
import PopupAlert from "../functional/PopupAlert"

export default function AdminLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<signInType>()

    const onSubmitSignin: SubmitHandler<signInType> = async (data) => {
        setIsLoading(true)
        console.log('🔐 Admin login attempt started')
        console.log('Email:', data.email)
        console.log('Password provided:', data.password ? 'YES' : 'NO')
        
        try {
            console.log('📡 Calling signIn API...')
            const res = await signIn({ email: data.email, password: data.password })
            console.log('📡 API Response:', res)
            
            if (res !== 'Login successfully!') {
                console.error('❌ Login failed with response:', res)
                throw Error(res)
            }
            
            console.log('✅ Login successful!')
            toast.success(res)
            
            // Redirect to admin dashboard after successful login
            setTimeout(() => {
                console.log('🔄 Redirecting to dashboard...')
                router.push('/dashboard')
            }, 500)
        } catch (error: any) {
            console.error('❌ Admin login error details:')
            console.error('Error message:', error.message)
            console.error('Error object:', error)
            console.error('Full error:', JSON.stringify(error, null, 2))
            
            setAlertMessage(error.message || 'Invalid Credentials')
            setShowAlert(true)
        } finally {
            setIsLoading(false)
            console.log('🏁 Admin login attempt completed')
        }
    }

    return (
        <>
            <PopupAlert 
                message={alertMessage}
                isVisible={showAlert}
                onClose={() => setShowAlert(false)}
            />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-300">Sign in to access the dashboard</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmitSignin)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="royaldigitalmart@gmail.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                            {...register("email", { 
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm">{errors.email.message}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500 pr-12"
                                {...register("password", { 
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-sm">{errors.password.message}</p>
                        )}
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
                    </Button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Default: royaldigitalmart@gmail.com / Royal@007
                    </p>
                </div>
            </div>
        </div>
        </>
    )
}