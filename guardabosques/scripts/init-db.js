import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function init() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guardabosques_leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_guardabosques_score ON guardabosques_leaderboard(score DESC)
    `;

    console.log('✅ Guardabosques DB initialized');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

init();
