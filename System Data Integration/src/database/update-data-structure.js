const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function updateDataStructure() {
  try {
    console.log('Updating existing data to new structure...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'update_existing_data_to_new_structure.sql'),
      'utf8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('✅ Data structure updated successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the backend: npm start');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('3. Login and check if data displays correctly');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file for correct database credentials');
    console.error('3. Run schema migration first: node src/database/run-migration.js');
    process.exit(1);
  }
}

updateDataStructure();
