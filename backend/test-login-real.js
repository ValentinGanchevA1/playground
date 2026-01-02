const http = require('http');

const loginData = JSON.stringify({
  email: 'vganchev@gmail.com',
  password: 'Password123!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(loginOptions, (res) => {
  console.log(`Login Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Login Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(loginData);
req.end();
