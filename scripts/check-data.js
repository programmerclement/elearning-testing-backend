'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT||'3306'),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const tables = ['users','courses','chapters','exercises','syllabuses','syllabus_outlines','invoices','enrollments'];
  for (const t of tables) {
    const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM ${t}`);
    console.log(`${t}: ${rows[0].c} rows`);
  }

  // Check status of courses
  const [courses] = await conn.query('SELECT id, title, status FROM courses');
  courses.forEach(c => console.log(`  Course ${c.id}: "${c.title}" [${c.status}]`));

  await conn.end();
})().catch(e => { console.error(e.message); process.exit(1); });
