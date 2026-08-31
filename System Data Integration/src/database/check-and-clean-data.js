/**
 * Script to check and clean old fee_data entries
 * Run this to remove old 8-field data and keep only new 16-field data
 */

const pool = require('./pool');

async function checkAndCleanData() {
  const client = await pool.connect();
  
  try {
    console.log('Checking fee_data table...\n');
    
    // Check for old data (data with NULL in new fields)
    const oldDataResult = await client.query(`
      SELECT id, contributor_id, status, created_at,
             submitter_name, service_provider, service_recipient, tax_year
      FROM fee_data
      WHERE submitter_name IS NULL 
         OR service_provider IS NULL 
         OR service_recipient IS NULL
         OR tax_year IS NULL
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${oldDataResult.rows.length} old data entries (with NULL in new fields)`);
    
    if (oldDataResult.rows.length > 0) {
      console.log('\nOld data entries:');
      oldDataResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, Status: ${row.status}, Created: ${row.created_at}`);
      });
      
      console.log('\n⚠️  These entries are using the old 8-field structure.');
      console.log('They need to be deleted or migrated to the new 16-field structure.\n');
      
      // Uncomment the line below to DELETE old data
      // await client.query('DELETE FROM fee_data WHERE submitter_name IS NULL OR service_provider IS NULL');
      // console.log('✅ Old data deleted successfully!\n');
    } else {
      console.log('✅ No old data found. All entries use the new 16-field structure.\n');
    }
    
    // Check for new data
    const newDataResult = await client.query(`
      SELECT id, contributor_id, status, created_at,
             submitter_name, service_provider, service_recipient, tax_year, fee_amount
      FROM fee_data
      WHERE submitter_name IS NOT NULL 
        AND service_provider IS NOT NULL 
        AND service_recipient IS NOT NULL
        AND tax_year IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${newDataResult.rows.length} new data entries (with complete 16 fields)`);
    
    if (newDataResult.rows.length > 0) {
      console.log('\nRecent new data entries:');
      newDataResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}`);
        console.log(`   Submitter: ${row.submitter_name}`);
        console.log(`   Provider: ${row.service_provider}`);
        console.log(`   Recipient: ${row.service_recipient}`);
        console.log(`   Tax Year: ${row.tax_year}`);
        console.log(`   Amount: ${row.fee_amount}`);
        console.log(`   Status: ${row.status}`);
        console.log('');
      });
    }
    
    console.log('\n=== Summary ===');
    console.log(`Old data (needs cleanup): ${oldDataResult.rows.length}`);
    console.log(`New data (correct structure): ${newDataResult.rows.length}`);
    console.log('\nTo delete old data, uncomment the DELETE line in this script and run again.');
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "fee_intelligence" exists');
    console.error('3. .env file has correct database credentials\n');
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndCleanData();
