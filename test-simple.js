const http = require('http');

// List of endpoints to test
const endpoints = [
  { path: '/api/courses', method: 'GET', name: 'List Courses (no auth needed)' },
  { path: '/api/courses/1/all-attempts', method: 'GET', name: 'Get All Attempts for course 1', needsAuth: true },
  { path: '/api/courses/1/exercise-attempts', method: 'GET', name: 'Get Student Attempts for course 1', needsAuth: true }
];

// Try to get token from stored file or just test without auth first
async function testEndpoints() {
  // First test without auth
  console.log('=' .repeat(60));
  console.log('Testing public endpoint (should work without auth):');
  console.log('='.repeat(60) + '\n');

  await testEndpoint('/api/courses', 'GET', null, 'List Courses');

  console.log('\n' + '='.repeat(60));
  console.log('Testing protected endpoints (need auth):');
  console.log('='.repeat(60) + '\n');

  // For protected endpoints, we'll test without auth to see the error  
  await testEndpoint('/api/courses/1/all-attempts', 'GET', null, 'All Attempts (no auth)');
  await testEndpoint('/api/courses/1/exercise-attempts', 'GET', null, 'Exercise Attempts (no auth)');
}

function testEndpoint(path, method, token, title) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`📍 ${title}`);
    console.log(`   Endpoint: ${method} ${path}`);
    console.log(`   Auth: ${token ? 'Yes' : 'No'}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Raw response:`, data.substring(0, 200));
        }
        console.log();
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Error: ${e.message}`);
      console.log();
      resolve();
    });

    req.end();
  });
}

testEndpoints().catch(console.error);
