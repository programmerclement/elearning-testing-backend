#!/usr/bin/env node

/**
 * Course Builder Integration Test
 * Run after both backend and frontend servers are started
 */

const http = require('http');
const https = require('https');

const API_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5174';

// Test credentials
const testUser = {
  email: 'instructor@test.com',
  password: 'Test@123456',
  name: 'Test Instructor',
  role: 'instructor'
};

let authToken = '';
let courseId = '';

// Utility function to make HTTP requests
function makeRequest(url, method = 'GET', data = null, token = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('🚀 Starting Course Builder Integration Tests\n');

  try {
    // 1. Check API Health
    console.log('📋 Test 1: API Health Check');
    const health = await makeRequest(`${API_URL}/health`);
    if (health.status === 200) {
      console.log('✅ API is running\n');
    } else {
      throw new Error('API health check failed');
    }

    // 2. Register test user
    console.log('📋 Test 2: User Registration');
    const registerRes = await makeRequest(`${API_URL}/api/auth/register`, 'POST', {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: testUser.role
    });
    
    if (registerRes.status === 201 || registerRes.status === 409) { // 409 if user already exists
      console.log(`✅ Registration successful (or user exists)\n`);
    } else {
      throw new Error(`Registration failed: ${registerRes.status}`);
    }

    // 3. Login
    console.log('📋 Test 3: User Login');
    const loginRes = await makeRequest(`${API_URL}/api/auth/login`, 'POST', {
      email: testUser.email,
      password: testUser.password
    });

    if (loginRes.status === 200 && loginRes.data.data?.token) {
      authToken = loginRes.data.data.token;
      console.log('✅ Login successful\n');
    } else {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    // 4. Create Course (Step 1)
    console.log('📋 Test 4: Create Course (Step 1)');
    const courseRes = await makeRequest(`${API_URL}/api/courses`, 'POST', {
      title: 'Test Course - ' + Date.now(),
      description: 'A test course for validation',
      category: 'Web Development',
      duration_weeks: 12,
      required_hours_per_week: 5,
      subscription_price: 49.99,
      education_level: 'Intermediate',
      target_audience: 'Developers with experience',
      objectives: 'Learn advanced concepts',
      language: 'English'
    }, authToken);

    if (courseRes.status === 201 && courseRes.data.data?.id) {
      courseId = courseRes.data.data.id;
      console.log(`✅ Course created: ID ${courseId}\n`);
    } else {
      throw new Error(`Course creation failed: ${courseRes.status}`);
    }

    // 5. Create Chapter (Step 2)
    console.log('📋 Test 5: Create Chapter (Step 2)');
    const chapterRes = await makeRequest(
      `${API_URL}/api/courses/${courseId}/chapters`,
      'POST',
      {
        title: 'Chapter 1: Introduction',
        subtitle: 'Getting started',
        week_number: 1,
        description: 'First chapter of the course',
        intro_message: 'Welcome to this chapter!'
      },
      authToken
    );

    if (chapterRes.status === 201 && chapterRes.data.data?.id) {
      console.log(`✅ Chapter created: ID ${chapterRes.data.data.id}\n`);
    } else {
      throw new Error(`Chapter creation failed: ${chapterRes.status}`);
    }

    const chapterId = chapterRes.data.data.id;

    // 6. Create Exercise
    console.log('📋 Test 6: Create Exercise (Step 2)');
    const exerciseRes = await makeRequest(
      `${API_URL}/api/chapters/${chapterId}/exercises`,
      'POST',
      {
        question: 'What is the capital of France?',
        type: 'radio',
        options: [
          { label: 'Paris', is_correct: true },
          { label: 'Lyon', is_correct: false },
          { label: 'Marseille', is_correct: false }
        ],
        points: 1
      },
      authToken
    );

    if (exerciseRes.status === 201) {
      console.log('✅ Exercise created\n');
    } else {
      throw new Error(`Exercise creation failed: ${exerciseRes.status}`);
    }

    // 7. Publish Course
    console.log('📋 Test 7: Publish Course');
    const publishRes = await makeRequest(
      `${API_URL}/api/courses/${courseId}/publish`,
      'PUT',
      {},
      authToken
    );

    if (publishRes.status === 200) {
      console.log('✅ Course published\n');
    } else {
      throw new Error(`Publish failed: ${publishRes.status}`);
    }

    // 8. Get Full Course (Step 4 - Review)
    console.log('📋 Test 8: Get Full Course Structure (Step 4)');
    const fullCourseRes = await makeRequest(
      `${API_URL}/api/courses/${courseId}`,
      'GET',
      null,
      authToken
    );

    if (fullCourseRes.status === 200 && fullCourseRes.data.data?.chapters) {
      console.log('✅ Course structure retrieved');
      console.log(`   - Chapters: ${fullCourseRes.data.data.chapters.length}`);
      console.log(`   - Total Exercises: ${fullCourseRes.data.data.chapters.reduce((sum, ch) => sum + (ch.exercises?.length || 0), 0)}\n`);
    } else {
      throw new Error(`Get course failed: ${fullCourseRes.status}`);
    }

    // 9. Get Invoice Preview (Step 3)
    console.log('📋 Test 9: Get Invoice Preview (Step 3)');
    const invoiceRes = await makeRequest(
      `${API_URL}/api/invoices/preview?course_id=${courseId}`,
      'GET'
    );

    if (invoiceRes.status === 200) {
      const invoice = invoiceRes.data.data || invoiceRes.data;
      console.log('✅ Invoice preview retrieved:');
      console.log(`   - Subtotal: $${invoice.subtotal}`);
      console.log(`   - Service Fee: $${invoice.service_fee}`);
      console.log(`   - VAT: $${invoice.vat}`);
      console.log(`   - Total: $${invoice.total}\n`);
    } else {
      throw new Error(`Invoice preview failed: ${invoiceRes.status}`);
    }

    // 10. Process Payment (Step 3 -> Step 4)
    console.log('📋 Test 10: Process Payment');
    const paymentRes = await makeRequest(
      `${API_URL}/api/payments`,
      'POST',
      {
        course_id: courseId,
        payment_method: 'credit_card'
      },
      authToken
    );

    if (paymentRes.status === 201 || paymentRes.status === 200) {
      const invoiceId = paymentRes.data.data?.id || paymentRes.data.data?.invoice_id;
      console.log(`✅ Payment processed: Invoice ID ${invoiceId}\n`);
    } else {
      throw new Error(`Payment failed: ${paymentRes.status}`);
    }

    // Export test results
    console.log('✅ All tests passed!\n');
    console.log('📊 Test Summary:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Course ID: ${courseId}`);
    console.log(`   - Course Title: ${fullCourseRes.data.data.title}`);
    console.log(`   - Total Price: ${invoiceRes.data.data.total}`);
    console.log('\n✨ Course builder is fully functional!\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  console.log('\n📖 API Documentation: http://localhost:3000/api/docs');
  console.log('🌐 Frontend: http://localhost:5174');
  console.log('\n🎓 To test manually:');
  console.log('   1. Go to http://localhost:5174/login');
  console.log('   2. Login with:');
  console.log(`      Email: ${testUser.email}`);
  console.log(`      Password: ${testUser.password}`);
  console.log('   3. Click "Create Course (New)"');
  console.log('   4. Follow the 4-step builder\n');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
