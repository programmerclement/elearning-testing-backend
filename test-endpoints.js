const https = require('https');
const http = require('http');

// Get a JWT token first by logging in
const loginData = JSON.stringify({
  email: 'alice@elearn.com',
  password: 'password123'
});

console.log('🔐 Attempting to login first...\n');

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Login response:', response);
      
      if (response.data && response.data.token) {
        const token = response.data.token;
        console.log('\n✅ Got token:', token.substring(0, 20) + '...\n');
        
        // Now test the endpoints
        testEndpoint(token, 'GET', '/api/courses/1/all-attempts', 'Instructor all attempts');
        testEndpoint(token, 'GET', '/api/courses/1/exercise-attempts', 'Student exercise attempts');
      } else {
        console.log('❌ No token in response');
      }
    } catch (e) {
      console.error('Error parsing login response:', e);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login error:', e);
});

loginReq.write(loginData);
loginReq.end();

function testEndpoint(token, method, path, title) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  console.log(`\n📍 Testing: ${title}`);
  console.log(`   Path: ${path}\n`);

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response:`, JSON.stringify(response, null, 2));
      } catch (e) {
        console.error('   Parse error:', e.message);
        console.log('   Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`   Error: ${e.message}`);
  });

  req.end();

  // Add delay to prevent overlapping responses
  setTimeout(() => {}, 1000);
}
