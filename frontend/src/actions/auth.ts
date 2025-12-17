'use server'

import { signInType, signUpType } from "@/types/auth"
import { jwtDecode } from "jwt-decode"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const decodeJWT=(jwt:string)=>{
    try {
        if (!jwt || jwt.split('.').length !== 3) {
            return null
        }
        const decode:any=jwtDecode(jwt)
        return decode.user || decode
    } catch (error) {
        // Sanitize error for logging
        const sanitizedError = error instanceof Error 
            ? error.message.replace(/[\r\n\t]/g, ' ').substring(0, 200)
            : 'JWT decode error';
        console.error('Invalid JWT token:', sanitizedError)
        return null
    }
}

export async function signIn({email,password}:signInType){
    try {
        console.log('🌐 Frontend signIn called')
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
        console.log('Login endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`)
        
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,{
            method:'POST',
            body:JSON.stringify({
                email,password
            }),
            headers:{
                'content-type':'application/json'
            }
        })
        
        console.log('📡 HTTP Response status:', res.status)
        console.log('📡 HTTP Response ok:', res.ok)
        
        const result=await res.json()
        console.log('📡 Response body:', result)
        
        if(!result.accessToken){
            console.error('❌ No accessToken in response')
            let errorMsg = 'Invalid Credentials'
            if (result.errors && result.errors.length > 0) {
                if (result.errors[0].msg === 'Invalid credentials') {
                    errorMsg = 'Invalid Credentials'
                } else {
                    errorMsg = result.errors[0].msg
                }
                console.log('Error from backend:', errorMsg)
            } else if (result.message) {
                errorMsg = result.message
                console.log('Message from backend:', errorMsg)
            }
            return errorMsg
        }
        
        console.log('✅ AccessToken received, setting cookie')
        const cookie=cookies()
        // Set cookie that can be accessed by client-side JavaScript
        cookie.set('token',result.accessToken,{
            httpOnly: false,  // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 10 // 10 days
        })
        return 'Login successfully!'
    } catch (error:any) {
        console.error('❌ Frontend signIn error:')
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        return 'Invalid Credentials'
    }
}

export async function sendOTP(email: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/send-otp`, {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: {
                'content-type': 'application/json'
            }
        })
        const result = await res.json()
        
        // Check for errors in response
        if (!res.ok || result.errors) {
            if (result.errors && result.errors.length > 0) {
                return result.errors[0].msg
            }
            return result.message || 'Failed to send OTP'
        }
        
        // Return the message directly from backend
        return result.message || 'OTP sent successfully'
    } catch (error: any) {
        return 'Failed to send OTP'
    }
}

export async function signUp({username,email,password,confirmPassword,otp}:signUpType){
    try {
        console.log('🔵 SignUp attempt:', { username, email, hasOtp: !!otp })
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/signup`,{
            method:'POST',
            body:JSON.stringify({
                username,email,password,confirmPassword,otp
            }),
            headers:{
                'content-type':'application/json'
            }
        })
        console.log('📡 SignUp response status:', res.status)
        console.log('📡 SignUp response ok:', res.ok)
        
        const result=await res.json()
        console.log('📡 SignUp response body:', JSON.stringify(result, null, 2))
        
        // Check if response is not OK (status 400, 401, etc.)
        if(!res.ok || !result.accessToken){
            let errorMsg = 'Unable to signup, please try again!'
            if (result.errors && result.errors.length > 0) {
                errorMsg = result.errors[0].msg
                if (errorMsg === 'Email already exists') {
                    errorMsg = 'Email already exist'
                }
            } else if (result.message) {
                errorMsg = result.message
                if (errorMsg === 'Email already registered!') {
                    errorMsg = 'Email already exist'
                }
            }
            console.log('❌ SignUp failed:', errorMsg)
            return errorMsg
        }
        const cookie=cookies()
        cookie.set('token',result.accessToken,{
            httpOnly: false,  // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 10 // 10 days
        })
        console.log('✅ SignUp successful')
        return 'Signup successfully!'
    } catch (error:any) {
        console.error('❌ SignUp error:', error)
        return 'Unable to signup, please try again!'
    }
}

export async function getUserData() {
    const cookie=cookies()
    const token=cookie.get('token')
    if(token && token.value){
        const userData=decodeJWT(token.value)
        if(userData){
            // Sanitize user data for logging (remove sensitive info)
            const sanitizedUserData = {
                id: userData.id,
                email: userData.email?.substring(0, 20) + '...',
                role: userData.role
            };
            console.log('User data from token:', sanitizedUserData)
            return userData
        }
    }
    console.log('No valid token found')
    return null
}

export async function Logout(){
    const cookie=cookies()
    cookie.delete('token')
    redirect('/')
}

export async function clientLogout(){
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        })
        return response.ok
    } catch (error) {
        console.error('Logout error:', error)
        return false
    }
}


