#!/usr/bin/env node

/**
 * load-seed.js — Load seed data from SQL file into database
 * Run: node scripts/load-seed.js
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'elearning_db';

(async () => {
  console.log('\n🌱  E-Learning Seed Data Loader');
  console.log('─'.repeat(50));
  console.log(`Host : ${DB_HOST}:${DB_PORT}`);
  console.log(`User : ${DB_USER}`);
  console.log(`DB   : ${DB_NAME}`);

  let conn;
  try {
    // Connect with multipleStatements enabled
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    console.log('\n✅  Connected to MySQL');
    console.log(`✅  Using database "${DB_NAME}"`);

    const seedPath = path.join(process.cwd(), 'database', 'seed-upgraded.sql');
    console.log(`\n📄  Loading seed data from ${path.basename(seedPath)}...`);

    if (!fs.existsSync(seedPath)) {
      console.error(`❌  Seed file not found: ${seedPath}`);
      process.exit(1);
    }

    let sql = fs.readFileSync(seedPath, 'utf8');

    // Remove comments
    sql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    try {
      await conn.query(sql);
      console.log(`\n✅  Seed data loaded successfully!`);
    } catch (err) {
      console.error(`\n❌  Seed Error: ${err.sqlMessage || err.message}`);
      if (err.sql) console.error(`SQL: ${err.sql.substring(0, 200)}...`);
      throw err;
    }

    // Verify data
    console.log('\n📊  Verifying data counts...');

    const tables = [
      'users',
      'courses',
      'chapters',
      'exercises',
      'syllabuses',
      'coupons',
      'enrollments',
      'invoices',
    ];

    for (const table of tables) {
      const [[{ count }]] = await conn.query(
        `SELECT COUNT(*) as count FROM ${table}`
      );
      console.log(`   • ${table}: ${count} rows`);
    }

    await conn.end();
    console.log('\n✨  Seed data loaded!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Failed:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
