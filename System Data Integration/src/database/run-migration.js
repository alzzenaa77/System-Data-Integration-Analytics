const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigration() {
  try {
    console.log('Running migration: add_submission_date_to_cross_division...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_submission_date_to_cross_division.sql'),
      'utf8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
