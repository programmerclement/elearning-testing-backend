#!/usr/bin/env node
/**
 * Test script to verify coupon verification API endpoint
 * Usage: node test-coupon-endpoint.js
 */

const http = require('http');

const testCoupon = (code) => {
  return new Promise((resolve, reject) => {
    const path = `/api/coupons/verify/${code}`;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n✓ Response for ${code}:`);
          console.log('  Status:', res.statusCode);
          console.log('  Response:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.error(`✗ Invalid JSON response: ${data}`);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Request error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
};

async function runTests() {
  console.log('Testing Coupon Verification Endpoint');
  console.log('====================================\n');

  const testCodes = ['SAVE10', 'EARLY20', 'WELCOME15', 'INVALID_CODE'];

  for (const code of testCodes) {
    try {
      await testCoupon(code);
    } catch (error) {
      console.error(`Error testing ${code}:`, error.message);
    }
  }

  console.log('\n✓ All tests completed!');
}

runTests().catch(console.error);
