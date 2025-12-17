import {z} from 'zod'
const signIn=z.object({
    email:z.string().email(),
    password:z.string().min(6)
})

const signUp=z.object({
    username:z.string().min(3),
    email:z.string().email(),
    password:z.string().min(6),
    confirmPassword:z.string().min(6),
    otp:z.string().min(6).max(6)
})

export type signInType = z.infer<typeof signIn>;

export type signUpType=z.infer<typeof signUp>