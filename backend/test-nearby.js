// Quick test script for nearby API
const axios = require('axios');

async function test() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email: 'test@test.com',
      password: 'Password123!'
    });
    console.log('Logged in!');
    const token = loginRes.data.accessToken;

    // Fetch nearby
    const nearbyRes = await axios.get('http://localhost:3001/locations/nearby', {
      params: {
        latitude: 37.78825,
        longitude: -122.4324,
        radiusKm: 10
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Nearby users:', nearbyRes.data.length);
    console.log('Sample:', JSON.stringify(nearbyRes.data.slice(0, 3), null, 2));
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
