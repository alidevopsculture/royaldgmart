'use server'

import { cookies } from 'next/headers'

export async function getUserProfile() {
  try {
    const cookie = cookies()
    const token = cookie.get('token')
    
    if (!token || !token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    const result = await res.json();
    
    if (!res.ok) {
      return { success: false, error: result.errors?.[0]?.msg || result.message || 'Failed to fetch profile' };
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

// Client-side profile fetching function
export async function getUserProfileClient() {
  // Early return if not in browser
  if (typeof window === 'undefined') {
    return { success: false, error: 'Server side rendering' };
  }

  try {
    let token;
    try {
      token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    } catch (e) {
      return { success: false, error: 'Cannot access cookies' };
    }
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const result = await res.json();
    
    if (!res.ok) {
      return { success: false, error: result.errors?.[0]?.msg || result.message || 'Failed to fetch profile' };
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(profileData: any) {
  try {
    const cookie = cookies()
    const token = cookie.get('token')
    
    if (!token || !token.value) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(profileData)
    });

    const result = await res.json();
    
    if (!res.ok) {
      return { success: false, error: result.errors?.[0]?.msg || result.message || 'Failed to update profile' };
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

// Client-side profile update function
export async function updateProfileClient(profileData: any) {
  // Early return if not in browser
  if (typeof window === 'undefined') {
    return { success: false, error: 'Server side rendering' };
  }

  try {
    let token;
    try {
      token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    } catch (e) {
      return { success: false, error: 'Cannot access cookies' };
    }
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });

    const result = await res.json();
    
    if (!res.ok) {
      return { success: false, error: result.errors?.[0]?.msg || result.message || 'Failed to update profile' };
    }

    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}