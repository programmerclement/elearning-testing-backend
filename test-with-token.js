const http = require('http');
const jwt = require('jsonwebtoken');

// Create a valid JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const token = jwt.sign(
  { id: 1, email: 'user@gmail.com', role: 'instructor' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('🔐 Generated token:', token.substring(0, 30) + '...\n');

// Test endpoints with token
async function testWithAuth() {
  await testEndpoint('/api/courses/1/all-attempts', 'GET', token, 'Get All Attempts (instructor view)');
  await delay(500);
  await testEndpoint('/api/courses/1/exercise-attempts', 'GET', token, 'Get Exercise Attempts (student view)');
}

function testEndpoint(path, method, token, title) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    console.log(`📍 ${title}`);
    console.log(`   Path: ${method} ${path}\n`);

    let fullData = '';
    const req = http.request(options, (res) => {
      res.on('data', chunk => fullData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(fullData);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response structure:`, {
            success: json.success,
            hasData: !!json.data,
            dataType: Array.isArray(json.data) ? 'array' : typeof json.data,
            dataLength: Array.isArray(json.data) ? json.data.length : 'N/A',
            firstRecord: Array.isArray(json.data) && json.data.length > 0 ? json.data[0] : null
          });
          console.log(`\n   Full Response:\n`, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(`   ❌ Parse error:`, e.message);
          console.log(`   Raw data:`, fullData.substring(0, 300));
        }
        console.log('\n' + '='.repeat(60) + '\n');
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Error: ${e.message}\n`);
      resolve();
    });

    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testWithAuth().catch(console.error);
