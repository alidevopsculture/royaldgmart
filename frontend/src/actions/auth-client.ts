'use client'

export async function forgotPassword(email: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: {
                'content-type': 'application/json'
            }
        })
        const result = await res.json()
        return result.message || 'Failed to send reset email'
    } catch (error: any) {
        return 'Failed to send reset email'
    }
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword }),
            headers: {
                'content-type': 'application/json'
            }
        })
        const result = await res.json()
        
        if (!res.ok) {
            return result.message || 'Failed to reset password'
        }
        
        return 'Password reset successfully!'
    } catch (error: any) {
        return 'Failed to reset password'
    }
}
