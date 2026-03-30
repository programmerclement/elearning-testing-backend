#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const db = require('../src/config/db');

async function runMigration() {
  try {
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '../database/migration-step-1-4.sql'),
      'utf8'
    );

    // Split by semicolon and filter empty statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`⏳ Running ${statements.length} migration statements...`);

    let count = 0;
    for (const statement of statements) {
      try {
        await db.query(statement);
        count++;
        console.log(`✅ Statement ${count}/${statements.length}: OK`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
          console.log(`✅ Statement ${count}/${statements.length}: Already exists (skipped)`);
          count++;
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
