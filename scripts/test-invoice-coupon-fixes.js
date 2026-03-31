#!/usr/bin/env node
'use strict';

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test helper
async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
  } catch (err) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${err.message}`);
    testResults.failed++;
    testResults.errors.push({ test: name, error: err.message });
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 INVOICE & COUPON FIX VERIFICATION TESTS');
  console.log('═══════════════════════════════════════════════════════════');

  // Test 1: Register user
  let userId, courseId, token;
  await test('Register test user', async () => {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Instructor',
      email: `instructor-${Date.now()}@test.com`,
      password: 'Test@123456',
      role: 'instructor'
    });
    token = res.data.data.token;
    userId = res.data.data.user.id;
    if (!token) throw new Error('No token returned');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}`);
  });

  // Test 2: Create unpublished course for invoice preview
  await test('Create unpublished course (course builder mode)', async () => {
    const res = await axios.post(
      `${API_BASE}/courses`,
      {
        title: `Test Course ${Date.now()}`,
        description: 'Test course for invoice preview',
        category: 'Programming',
        subscription_price: 49.99,
        price: 49.99,
        level: 'beginner',
        duration_weeks: 4,
        required_hours_per_week: 5,
        education_level: 'Beginner',
        target_audience: 'Everyone',
        objectives: 'Learn programming',
        language: 'English'
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    courseId = res.data?.data?.id || res.data?.id;
    if (!courseId) throw new Error('No course ID returned');
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Price: $49.99`);
  });

  // Test 3: Invoice preview for UNPUBLISHED course (THIS USED TO FAIL)
  await test('Load invoice preview for UNPUBLISHED course (builder workflow)', async () => {
    const res = await axios.get(`${API_BASE}/invoices/preview`, {
      params: { course_id: courseId }
    });
    const data = res.data?.data || res.data;
    if (!data.total) throw new Error('No total in response');
    
    console.log(`   Original Price: $${data.original_price.toFixed(2)}`);
    console.log(`   Subtotal: $${data.subtotal.toFixed(2)}`);
    console.log(`   Service Fee (5%): $${data.service_fee.toFixed(2)}`);
    console.log(`   VAT (15%): $${data.vat.toFixed(2)}`);
    console.log(`   Total: $${data.total.toFixed(2)}`);
    
    // Verify calculations
    if (data.original_price !== 49.99) throw new Error('Original price incorrect');
    if (data.subtotal !== 49.99) throw new Error('Subtotal incorrect');
    if (data.service_fee !== 2.50) throw new Error('Service fee incorrect');
    if (data.vat !== 7.87) throw new Error('VAT incorrect');
    if (Math.abs(data.total - 60.36) > 0.01) throw new Error('Total incorrect');
  });

  // Test 4: Create test coupon
  let couponCode = `TEST${Date.now()}`;
  await test('Create test coupon', async () => {
    const res = await axios.post(
      `${API_BASE}/coupons`,
      {
        code: couponCode,
        discount_percentage: 10,
        is_active: 1
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!res.data.data.id) throw new Error('No coupon ID returned');
    console.log(`   Coupon Code: ${couponCode}`);
    console.log(`   Discount: 10%`);
  });

  // Test 5: Invoice preview WITH coupon (auto-calculation)
  await test('Load invoice preview with coupon (auto-calculate)', async () => {
    const res = await axios.get(`${API_BASE}/invoices/preview`, {
      params: {
        course_id: courseId,
        coupon_code: couponCode
      }
    });
    const data = res.data?.data || res.data;
    if (!data.coupon) throw new Error('Coupon not applied');
    
    // With 10% discount: 49.99 - 5.00 = 44.99
    const expectedSubtotal = 44.99;
    const expectedServiceFee = (expectedSubtotal * 0.05);
    const expectedVat = (expectedSubtotal + expectedServiceFee) * 0.15;
    
    console.log(`   Original Price: $${data.original_price.toFixed(2)}`);
    console.log(`   Discount (10%): -$${data.discount_amount.toFixed(2)}`);
    console.log(`   Subtotal: $${data.subtotal.toFixed(2)}`);
    console.log(`   Service Fee (5%): $${data.service_fee.toFixed(2)}`);
    console.log(`   VAT (15%): $${data.vat.toFixed(2)}`);
    console.log(`   Total: $${data.total.toFixed(2)}`);
    console.log(`   Coupon Code: ${data.coupon.code}`);
    console.log(`   Coupon Discount: ${data.coupon.discount_percentage}%`);
    console.log(`   💰 You save: $${data.discount_amount.toFixed(2)}`);
    
    // Verify calculations with coupon
    if (data.original_price !== 49.99) throw new Error('Original price incorrect');
    if (data.discount_amount !== 5.00) throw new Error('Discount amount incorrect');
    if (Math.abs(data.subtotal - 44.99) > 0.01) throw new Error('Subtotal incorrect');
  });

  // Test 6: Invoice without coupon (verify no discount)
  await test('Verify clear coupon returns to no discount', async () => {
    const res = await axios.get(`${API_BASE}/invoices/preview`, {
      params: { course_id: courseId }
    });
    const data = res.data?.data || res.data;
    
    if (data.discount_amount > 0) throw new Error('Discount should be 0 when no coupon');
    if (data.coupon !== null) throw new Error('Coupon should be null');
    
    console.log(`   Original Price: $${data.original_price.toFixed(2)}`);
    console.log(`   Subtotal (no discount): $${data.subtotal.toFixed(2)}`);
    console.log(`   Total: $${data.total.toFixed(2)}`);
  });

  // Test 7: Invalid coupon handling
  await test('Invalid coupon returns proper error', async () => {
    try {
      await axios.get(`${API_BASE}/invoices/preview`, {
        params: {
          course_id: courseId,
          coupon_code: 'INVALID_COUPON_12345'
        }
      });
      throw new Error('Should have thrown error for invalid coupon');
    } catch (err) {
      if (err.response?.status === 404 || err.message.includes('not found')) {
        console.log(`   ✓ Correctly rejected invalid coupon`);
      } else {
        throw err;
      }
    }
  });

  // Test 8: Publish course and verify it still works
  await test('Verify invoice preview works after publishing', async () => {
    // Publish the course
    await axios.put(
      `${API_BASE}/courses/${courseId}/publish`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Get invoice preview
    const res = await axios.get(`${API_BASE}/invoices/preview`, {
      params: { course_id: courseId }
    });
    const data = res.data?.data || res.data;
    if (!data.total) throw new Error('No total in response');
    
    console.log(`   Published course invoice still works ✓`);
    console.log(`   Total: $${data.total.toFixed(2)}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`📊 TEST RESULTS`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILURES:');
    testResults.errors.forEach(err => {
      console.log(`   - ${err.test}: ${err.error}`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Invoice & Coupon fixes are working!');
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
