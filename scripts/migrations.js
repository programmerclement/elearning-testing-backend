'use strict';

/**
 * migrations.js — Applies database migrations to an existing database.
 * Run: node scripts/migrations.js
 */

require('dotenv').config();

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'elearning_db';

(async () => {
  console.log('\n🚀  E-Learning Database Migrations');
  console.log('─'.repeat(50));
  console.log(`Host : ${DB_HOST}:${DB_PORT}`);
  console.log(`User : ${DB_USER}`);
  console.log(`DB   : ${DB_NAME}`);

  let conn;
  try {
    // Connect with multipleStatements enabled
    conn = await mysql.createConnection({
      host:               DB_HOST,
      port:               DB_PORT,
      user:               DB_USER,
      password:           DB_PASSWORD,
      database:           DB_NAME,
      multipleStatements: true,
    });

    console.log('\n✅  Connected to MySQL');
    console.log(`✅  Using database "${DB_NAME}"`);

    const migrationsPath = path.join(process.cwd(), 'database', 'migrations.sql');
    console.log(`\n📄  Applying migrations from ${path.basename(migrationsPath)}...`);

    let sql = fs.readFileSync(migrationsPath, 'utf8');

    // Comments and cleanup
    sql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    try {
      await conn.query(sql);
      console.log(`\n✅  All migrations applied successfully!`);
    } catch (err) {
      console.error(`\n❌  Migration Error: ${err.sqlMessage || err.message}`);
      console.error(`SQL Query: ${err.sql}`);
      throw err;
    }

    // Verify table structure
    console.log('\n📊  Verifying table structure...');
    
    const checkTables = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `;
    
    const [tables] = await conn.query(checkTables, [DB_NAME]);
    console.log(`\n📋  Tables in database (${tables.length} total):`);
    tables.forEach(t => console.log(`   • ${t.TABLE_NAME}`));

    await conn.end();
    console.log('\n✨  Migration complete!\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    if (conn) await conn.end();
    process.exit(1);
  }
})();
