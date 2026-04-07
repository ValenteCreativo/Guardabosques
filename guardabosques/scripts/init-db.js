import { neon } from '@neondatabase/serverless';

// Run once to create the table in Neon:
// DATABASE_URL=<your-neon-url> node scripts/init-db.js

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ Set DATABASE_URL before running this script');
  process.exit(1);
}

const sql = neon(url);

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
      CREATE INDEX IF NOT EXISTS idx_guardabosques_score
      ON guardabosques_leaderboard(score DESC)
    `;
    console.log('✅ guardabosques_leaderboard table ready');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

init();
