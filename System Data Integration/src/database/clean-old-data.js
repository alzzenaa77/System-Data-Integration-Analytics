/**
 * Script to clean old fee_data entries (8-field structure)
 * This will DELETE all old data that doesn't have the new 16 fields
 */

const pool = require('./pool');

async function cleanOldData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for old data...\n');
    
    // Count old data
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM fee_data
      WHERE submitter_name IS NULL 
         OR service_provider IS NULL 
         OR service_recipient IS NULL
         OR tax_year IS NULL
    `);
    
    const oldDataCount = parseInt(countResult.rows[0].count);
    
    if (oldDataCount === 0) {
      console.log('✅ No old data found. Database is clean!\n');
      return;
    }
    
    console.log(`Found ${oldDataCount} old data entries to delete.\n`);
    
    // Delete old data
    const deleteResult = await client.query(`
      DELETE FROM fee_data
      WHERE submitter_name IS NULL 
         OR service_provider IS NULL 
         OR service_recipient IS NULL
         OR tax_year IS NULL
      RETURNING id
    `);
    
    console.log(`✅ Successfully deleted ${deleteResult.rows.length} old data entries!\n`);
    
    // Verify
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM fee_data
      WHERE submitter_name IS NOT NULL 
        AND service_provider IS NOT NULL 
        AND service_recipient IS NOT NULL
        AND tax_year IS NOT NULL
    `);
    
    const remainingCount = parseInt(verifyResult.rows[0].count);
    console.log(`Remaining data entries (with correct structure): ${remainingCount}\n`);
    
  } catch (error) {
    console.error('❌ Error cleaning data:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "fee_intelligence" exists');
    console.error('3. .env file has correct database credentials\n');
  } finally {
    client.release();
    await pool.end();
  }
}

cleanOldData();
