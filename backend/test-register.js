const http = require('http');

// Register a test user
const registerData = JSON.stringify({
  email: 'vganchev@gmail.com',
  password: 'Password123!',
  displayName: 'Test User'
});

const registerOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

const req = http.request(registerOptions, (res) => {
  console.log(`Register Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Register Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(registerData);
req.end();
