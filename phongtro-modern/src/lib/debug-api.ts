// Debug API calls
export const debugAPI = async () => {
  console.log('=== DEBUG API CALLS ===');
  
  try {
    // Test direct fetch
    console.log('1. Testing direct fetch...');
    const response = await fetch('http://localhost:5000/api/v1/stats/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Direct fetch error:', error);
    return { success: false, error };
  }
};

// Test with different URLs
export const testURLs = async () => {
  const urls = [
    'http://localhost:5000/api/v1/stats/overview',
    'http://127.0.0.1:5000/api/v1/stats/overview',
    'http://localhost:5000/api/v1/stats/real-time',
  ];
  
  for (const url of urls) {
    try {
      console.log(`Testing URL: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      const data = await response.json();
      console.log(`Data:`, data);
    } catch (error) {
      console.error(`Error with ${url}:`, error);
    }
  }
};


