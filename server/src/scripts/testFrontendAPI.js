// Using built-in fetch (Node.js 18+)

const testFrontendAPI = async () => {
  try {
    console.log('🧪 Testing Frontend API call...');

    // Test the exact API call that frontend makes
    const baseUrl = 'http://127.0.0.1:5000';
    const endpoint = '/api/v1/dashboard/overview';
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`🌐 Testing URL: ${url}`);

    // Test without authentication (should fail)
    console.log('\n1. Testing without authentication...');
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log(`Status: ${response.status}`);
      const data = await response.text();
      console.log(`Response: ${data.substring(0, 200)}...`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    // Test with JWT token in header
    console.log('\n2. Testing with JWT token in header...');
    const JWT_SECRET = process.env.JWT_SECRET || 'asdfsadfsadf';
    const jwt = await import('jsonwebtoken');
    
    // Create a test token for landlord@test.com
    const testToken = jwt.default.sign(
      { 
        id: '68d6113f4289c23f7574d3d8', // landlord@test.com user ID
        email: 'landlord@test.com', 
        role: 'landlord' 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        }
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Total Views: ${data.data?.stats?.totalViews || 'N/A'}`);
        console.log(`   - Total Posts: ${data.data?.stats?.totalPosts || 'N/A'}`);
        console.log(`   - Active Posts: ${data.data?.stats?.activePosts || 'N/A'}`);
        console.log(`   - Pending Requests: ${data.data?.stats?.pendingRequests || 'N/A'}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    // Test with cookie (simulating frontend behavior)
    console.log('\n3. Testing with cookie (frontend simulation)...');
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `accessToken=${testToken}`
        },
        credentials: 'include'
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with cookie! Total Views: ${data.data?.stats?.totalViews || 'N/A'}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    console.log('\n🎉 Frontend API test completed!');

  } catch (error) {
    console.error('❌ Error testing frontend API:', error);
  }
};

// Run the test
testFrontendAPI();
