'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await conn.query('SHOW TABLES');
  console.log(`Tables in ${process.env.DB_NAME}:`);
  rows.forEach(r => console.log(' -', Object.values(r)[0]));
  await conn.end();
})().catch(e => { console.error(e.message); process.exit(1); });
