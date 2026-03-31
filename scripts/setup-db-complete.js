#!/usr/bin/env node
/**
 * Database Setup Script
 * Initializes all required tables for the e-learning platform
 * 
 * Usage: node setup-db.js
 * 
 * This script will:
 * 1. Connect to the database
 * 2. Create all tables from schema.sql
 * 3. Optionally seed sample data
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elearning_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function setupDatabase() {
  let connection;
  try {
    console.log('🔧 Setting up database...\n');
    console.log(`📌 Database Config:`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}\n`);

    // Create connection without selecting database first
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    console.log('✓ Connected to MySQL\n');

    // Create database if it doesn't exist
    console.log('📦 Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    console.log(`✓ Database ${config.database} ready\n`);

    // Select database
    await connection.query(`USE ${config.database}`);
    console.log(`✓ Selected database: ${config.database}\n`);

    // Read and execute schema.sql
    console.log('🗂️  Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by statements (simple split, may need improvement for complex SQL)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements\n`);

    console.log('🚀 Executing schema statements...\n');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        const tableName = match ? match[1] : `Statement ${i + 1}`;
        
        process.stdout.write(`  [${i + 1}/${statements.length}] Creating ${tableName}... `);
        await connection.query(statement);
        console.log('✓');
        successCount++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('(already exists)');
          successCount++;
        } else {
          console.log('✗');
          console.error(`    Error: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✓ Successful: ${successCount}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    // Verify critical tables exist
    console.log('🔍 Verifying critical tables...\n');
    const criticalTables = ['users', 'courses', 'coupons', 'coupon_usage', 'payments'];
    
    for (const table of criticalTables) {
      const [rows] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [config.database, table]);
      
      const exists = rows[0].count > 0;
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. npm start (to start the backend server)');
    console.log('   2. Test coupon endpoint: curl http://localhost:5000/api/coupons/verify/SAVE10\n');

    await connection.end();
  } catch (error) {
    console.error('\n❌ Setup failed:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Fix: Check your database credentials in .env file');
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('💡 Fix: Make sure MySQL server is running');
    }
    
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
