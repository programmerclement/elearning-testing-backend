const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'elearning_db'
    });

    console.log('✅ Connected to database\n');

    // Check if there are any exercise attempts
    const [attempts] = await connection.execute(`
      SELECT 
        ea.id,
        ea.user_id,
        ea.exercise_id,
        ea.is_correct,
        ea.score,
        ea.attempted_at,
        u.name AS student_name,
        e.question AS exercise_title,
        c.title AS chapter_title
      FROM exercise_attempts ea
      LEFT JOIN users u ON u.id = ea.user_id
      LEFT JOIN exercises e ON e.id = ea.exercise_id
      LEFT JOIN chapters c ON c.id = e.chapter_id
      LIMIT 10
    `);

    console.log('📊 Exercise Attempts in Database:');
    console.log('Total found:', attempts.length);
    console.log('Data:', JSON.stringify(attempts, null, 2));

    // Check the query that the endpoint uses
    console.log('\n\n🔍 Testing endpoint query for course_id = 1:');
    const [endpointResult] = await connection.execute(`
      SELECT 
        ea.id,
        ea.user_id,
        ea.exercise_id,
        ea.answer,
        ea.is_correct,
        ea.score,
        ea.attempted_at,
        u.name AS student_name,
        u.email AS student_email,
        e.question AS exercise_title,
        e.points,
        c.id AS chapter_id,
        c.title AS chapter_title,
        co.id AS course_id
      FROM exercise_attempts ea
      INNER JOIN users u ON u.id = ea.user_id
      INNER JOIN exercises e ON e.id = ea.exercise_id
      INNER JOIN chapters c ON c.id = e.chapter_id AND c.deleted_at IS NULL
      INNER JOIN courses co ON co.id = c.course_id AND co.deleted_at IS NULL
      WHERE co.id = ?
      ORDER BY ea.attempted_at DESC
    `, [1]);

    console.log('Results for course_id=1:', endpointResult.length);
    console.log('Data:', JSON.stringify(endpointResult, null, 2));

    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testDB();
