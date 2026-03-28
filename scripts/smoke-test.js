'use strict';

/**
 * Smoke-test script — runs key API endpoints and reports results.
 * Uses built-in http module only (no extra dependencies).
 * Run: node scripts/smoke-test.js
 */

const http = require('http');

const BASE = 'http://localhost:3000';
let passed = 0;
let failed = 0;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${path}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    }).on('error', reject);
  });
}

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const opts = {
      hostname: 'localhost', port: 3000,
      path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function check(label, fn, expectStatus) {
  try {
    const res = await fn();
    const ok = res.status === expectStatus;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon}  [${res.status}] ${label}`);
    if (!ok) console.log(`       Expected ${expectStatus}, got ${res.status}`, JSON.stringify(res.body).slice(0, 200));
    ok ? passed++ : failed++;
  } catch (err) {
    console.log(`❌  [ERR] ${label} — ${err.message}`);
    failed++;
  }
}

(async () => {
  console.log('\n🧪  E-Learning API Smoke Tests\n' + '─'.repeat(50));

  await check('GET /health',                            () => get('/health'),                              200);
  await check('GET /api/docs.json (Swagger spec)',      () => get('/api/docs.json'),                       200);
  await check('GET /api/dashboard/metrics',             () => get('/api/dashboard/metrics'),               200);
  await check('GET /api/dashboard/lessons-history',     () => get('/api/dashboard/lessons-history'),       200);
  await check('GET /api/courses (list)',                 () => get('/api/courses'),                         200);
  await check('GET /api/courses/1 (nested)',             () => get('/api/courses/1'),                       200);
  await check('GET /api/courses/9999 (not found)',       () => get('/api/courses/9999'),                    404);
  await check('GET /api/chapters/1',                    () => get('/api/chapters/1'),                      200);
  await check('GET /api/chapters/1/exercises',          () => get('/api/chapters/1/exercises'),            200);
  await check('GET /api/syllabuses/1',                  () => get('/api/syllabuses/1'),                    200);
  await check('GET /api/invoices/preview?course_id=1',  () => get('/api/invoices/preview?course_id=1'),    200);
  await check('GET /api/invoices/preview (no course_id)', () => get('/api/invoices/preview'),              400);
  await check('POST /api/courses (create draft)',
    () => post('/api/courses', { title: 'Smoke Test Course', price: 9.99, level: 'beginner' }), 201);
  await check('POST /api/courses (missing title)',
    () => post('/api/courses', {}), 400);
  await check('POST /api/payments (new enrollment)',
    () => post('/api/payments', { course_id: 1 }), 201);
  await check('POST /api/payments (already enrolled)',
    () => post('/api/payments', { course_id: 1 }), 400);
  await check('GET /api/unknown-route (404)',            () => get('/api/unknown-route'),                   404);

  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
