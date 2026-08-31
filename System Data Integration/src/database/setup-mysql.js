/**
 * MySQL Database Setup Script
 * This script will:
 * 1. Create database
 * 2. Create tables
 * 3. Insert seed data (optional)
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...\n');
    
    // Connect to MySQL without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL\n');
    
    // Create database
    console.log('🔄 Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS fee_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "fee_intelligence" created\n');
    
    // Use database
    await connection.query('USE fee_intelligence');
    
    // Read and execute schema
    console.log('🔄 Creating tables...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema-mysql.sql'), 'utf8');
    await connection.query(schemaSQL);
    console.log('✅ Tables created successfully\n');
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Tables created:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    console.log('');
    
    // Ask if user wants to insert seed data
    console.log('💡 Seed data contains 4 sample users and sample data.');
    console.log('   Do you want to insert seed data? (y/n)');
    console.log('   For now, skipping seed data. Run manually if needed.\n');
    
    // Uncomment below to insert seed data automatically
    /*
    console.log('🔄 Inserting seed data...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed-mysql.sql'), 'utf8');
    await connection.query(seedSQL);
    console.log('✅ Seed data inserted\n');
    */
    
    console.log('✅ Database setup completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Update .env file with database credentials');
    console.log('   2. Run: npm start');
    console.log('   3. Test the application\n');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\n⚠️  Troubleshooting:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check username and password in .env');
    console.error('   3. Try running XAMPP and start MySQL\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
