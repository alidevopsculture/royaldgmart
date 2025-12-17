'use server'

export async function getDashboardStats() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard statistics');
    }

    const stats = await response.json();
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return { success: false, error: error.message, stats: null };
  }
}

export async function getCustomers() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    const customers = await response.json();
    return { success: true, customers };
  } catch (error: any) {
    console.error('Get customers error:', error);
    return { success: false, error: error.message, customers: [] };
  }
}