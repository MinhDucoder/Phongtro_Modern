// Utility script to diagnose user filter issues
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

async function testUserFilters() {
  console.log('Testing user filter API...');

  try {
    // 1. Test connection to backend API
    console.log('1. Testing connection to backend API...');
    const healthCheck = await fetch(`${API_BASE_URL}/api/v1/system/health`);
    
    if (!healthCheck.ok) {
      console.error('❌ Backend API is not responding. Please check if the server is running.');
      return;
    }
    
    console.log('✅ Backend API is online.');
    
    // 2. Test getting all users
    console.log('\n2. Testing getting all users...');
    const allUsersResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users`);
    
    if (!allUsersResponse.ok) {
      console.error('❌ Failed to fetch all users:', allUsersResponse.status);
      return;
    }
    
    const allUsersData = await allUsersResponse.json();
    console.log(`✅ Successfully fetched ${allUsersData.data.users.length} users.`);
    
    // 3. Test filtering by role
    console.log('\n3. Testing filtering by role...');
    const roleFilters = ['user', 'landlord', 'admin'];
    
    for (const role of roleFilters) {
      const roleResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users?role=${role}`);
      
      if (!roleResponse.ok) {
        console.error(`❌ Failed to fetch ${role} users:`, roleResponse.status);
        continue;
      }
      
      const roleData = await roleResponse.json();
      console.log(`✅ Filter by role=${role}: Found ${roleData.data.users.length} users.`);
      
      // Check if users actually have the correct role
      const hasCorrectRole = roleData.data.users.every(user => user.role === role);
      console.log(`   Correct role filter: ${hasCorrectRole ? '✅ Yes' : '❌ No'}`);
    }
    
    // 4. Test filtering by status
    console.log('\n4. Testing filtering by status...');
    const statusFilters = ['active', 'banned', 'verified', 'unverified'];
    
    for (const status of statusFilters) {
      const statusResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users?status=${status}`);
      
      if (!statusResponse.ok) {
        console.error(`❌ Failed to fetch ${status} users:`, statusResponse.status);
        continue;
      }
      
      const statusData = await statusResponse.json();
      console.log(`✅ Filter by status=${status}: Found ${statusData.data.users.length} users.`);
    }
    
    console.log('\n✅ All filter tests completed.');
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the tests
testUserFilters();