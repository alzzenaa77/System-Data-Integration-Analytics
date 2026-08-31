/**
 * Script to verify database structure and check for any remaining data
 */

const pool = require('./pool');

async function verifyDatabase() {
    let connection;

    try {
        console.log('🔍 Verifying database structure...\n');

        connection = await pool.getConnection();

        // Check total fee_data count
        const [totalCount] = await connection.query(`
      SELECT COUNT(*) as count FROM fee_data
    `);
        console.log(`📊 Total fee_data entries: ${totalCount[0].count}`);

        // Check data with complete structure (16 fields)
        const [completeData] = await connection.query(`
      SELECT COUNT(*) as count
      FROM fee_data
      WHERE submitter_name IS NOT NULL 
        AND submitter_division IS NOT NULL
        AND service_provider IS NOT NULL 
        AND service_recipient IS NOT NULL
        AND tax_year IS NOT NULL
        AND financial_type IS NOT NULL
        AND fee_amount IS NOT NULL
    `);
        console.log(`✅ Complete data entries (16 fields): ${completeData[0].count}`);

        // Check data with incomplete structure (old data)
        const [incompleteData] = await connection.query(`
      SELECT COUNT(*) as count
      FROM fee_data
      WHERE submitter_name IS NULL 
         OR service_provider IS NULL 
         OR service_recipient IS NULL
         OR tax_year IS NULL
    `);
        console.log(`❌ Incomplete data entries (old structure): ${incompleteData[0].count}`);

        // Check by status
        const [statusBreakdown] = await connection.query(`
      SELECT status, COUNT(*) as count
      FROM fee_data
      GROUP BY status
    `);

        if (statusBreakdown.length > 0) {
            console.log('\n📋 Data by status:');
            statusBreakdown.forEach(row => {
                console.log(`   ${row.status}: ${row.count}`);
            });
        }

        // Show sample of recent data (if any)
        const [recentData] = await connection.query(`
      SELECT id, submitter_name, service_provider, service_recipient, tax_year, status, created_at
      FROM fee_data
      ORDER BY created_at DESC
      LIMIT 5
    `);

        if (recentData.length > 0) {
            console.log('\n📝 Recent data entries:');
            recentData.forEach(row => {
                console.log(`   ID: ${row.id} | Submitter: ${row.submitter_name || 'NULL'} | Provider: ${row.service_provider || 'NULL'} | Status: ${row.status}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        if (incompleteData[0].count === 0) {
            console.log('✅ DATABASE IS READY!');
            console.log('   All data has complete structure (16 fields)');
            console.log('   You can now submit new data via Contributor portal');
        } else {
            console.log('⚠️  WARNING: Database still has incomplete data!');
            console.log('   Run clean-old-data-mysql.js to remove old entries');
        }

        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error verifying database:', error.message);
    } finally {
        if (connection) {
            connection.release();
        }
        await pool.end();
    }
}

verifyDatabase();
