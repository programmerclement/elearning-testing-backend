'use strict';

/**
 * setup-db.js — Creates the database, applies schema.sql and seed.sql.
 * Uses multipleStatements mode to run the whole file in one shot.
 * Run: node scripts/setup-db.js
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

async function runFile(conn, filePath) {
  const label = path.basename(filePath);
  console.log(`\n📄  Applying ${label}...`);

  let sql = fs.readFileSync(filePath, 'utf8');

  // Strip out the CREATE DATABASE / USE statements — we handle those manually
  sql = sql
    .replace(/CREATE DATABASE[^;]*;/gi, '')
    .replace(/USE\s+\S+\s*;/gi, '');

  try {
    // Run the entire SQL file as-is via multipleStatements connection
    await conn.query(sql);
    console.log(`   ✅  ${label} applied.`);
  } catch (err) {
    // Surface the exact statement that failed
    console.error(`   ❌  Error in ${label}: ${err.sqlMessage || err.message}`);
    throw err;
  }
}

(async () => {
  console.log('\n🗄️   E-Learning Database Setup');
  console.log('─'.repeat(50));
  console.log(`Host : ${DB_HOST}:${DB_PORT}`);
  console.log(`User : ${DB_USER}`);
  console.log(`DB   : ${DB_NAME}`);

  let conn;
  try {
    // MUST use multipleStatements:true to run full SQL files
    conn = await mysql.createConnection({
      host:               DB_HOST,
      port:               DB_PORT,
      user:               DB_USER,
      password:           DB_PASSWORD,
      multipleStatements: true,
    });

    console.log('\n✅  Connected to MySQL');

    // Create DB if needed
    console.log(`\n🧹  Dropping existing database "${DB_NAME}" if it exists...`);
    await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await conn.query(
      `CREATE DATABASE \`${DB_NAME}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conn.query(`USE \`${DB_NAME}\``);
    console.log(`✅  Database "${DB_NAME}" ready`);

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const seedPath   = path.join(process.cwd(), 'database', 'seed.sql');

    await runFile(conn, schemaPath);
    await runFile(conn, seedPath);

    // Quick row-count verification
    console.log('\n📊  Row counts:');
    const tables = ['users','courses','chapters','exercises','syllabuses',
                    'syllabus_outlines','invoices','enrollments','reviews'];
    for (const t of tables) {
      const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
      console.log(`   ${t.padEnd(20)} ${rows[0].c} rows`);
    }

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  ✅  Database setup complete!                 ║');
    console.log('║  🚀  Run: npm run dev                         ║');
    console.log('╚══════════════════════════════════════════════╝\n');

  } catch (err) {
    console.error('\n❌  Setup failed:', err.message);
    if (err.code === 'ECONNREFUSED')
      console.error('   → Make sure MySQL is running on', `${DB_HOST}:${DB_PORT}`);
    if (err.code === 'ER_ACCESS_DENIED_ERROR')
      console.error('   → Check DB_USER / DB_PASSWORD in .env');
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
