// Test connection to backend API
export async function testBackendConnection(): Promise<boolean> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    // We expect this to fail with 401 (unauthorized) since it's a test account
    // But if we get a response, it means the connection is working
    return response.status === 401 || response.status === 400;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}

// Test function to check if backend is running
export async function checkBackendHealth(): Promise<{ status: boolean; message: string }> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { status: true, message: 'Backend is running' };
    } else {
      return { status: false, message: `Backend responded with status: ${response.status}` };
    }
  } catch (error) {
    return { 
      status: false, 
      message: `Cannot connect to backend: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
