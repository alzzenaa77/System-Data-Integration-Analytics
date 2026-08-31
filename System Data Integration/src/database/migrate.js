/**
 * Database Migration Script
 * Fee Intelligence & Market Benchmarking System
 * 
 * This script sets up the database schema and optionally loads seed data.
 * 
 * Usage:
 *   node src/database/migrate.js --setup          # Create schema only
 *   node src/database/migrate.js --setup --seed   # Create schema and load seed data
 *   node src/database/migrate.js --reset          # Drop and recreate schema
 *   node src/database/migrate.js --reset --seed   # Drop, recreate, and seed
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fee_intelligence_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Parse command line arguments
const args = process.argv.slice(2);
const shouldSetup = args.includes('--setup');
const shouldReset = args.includes('--reset');
const shouldSeed = args.includes('--seed');

/**
 * Read SQL file
 */
function readSQLFile(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Execute SQL script
 */
async function executeSQL(sql, description) {
  try {
    console.log(`\n${description}...`);
    await pool.query(sql);
    console.log(`✓ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ ${description} failed:`);
    console.error(error.message);
    return false;
  }
}

/**
 * Reset database (drop and recreate schema)
 */
async function resetDatabase() {
  const resetSQL = `
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO ${process.env.DB_USER || 'postgres'};
    GRANT ALL ON SCHEMA public TO public;
  `;
  return await executeSQL(resetSQL, 'Resetting database');
}

/**
 * Setup database schema
 */
async function setupSchema() {
  const schemaSQL = readSQLFile('schema.sql');
  return await executeSQL(schemaSQL, 'Creating database schema');
}

/**
 * Load seed data
 */
async function loadSeedData() {
  const seedSQL = readSQLFile('seed.sql');
  return await executeSQL(seedSQL, 'Loading seed data');
}

/**
 * Verify database connection
 */
async function verifyConnection() {
  try {
    console.log('\nVerifying database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log(`✓ Connected to database at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    return false;
  }
}

/**
 * Display database statistics
 */
async function displayStats() {
  try {
    console.log('\n=== Database Statistics ===');
    
    const tables = [
      'users',
      'fee_data',
      'cross_division_data',
      'clarification_history',
      'notifications',
      'point_transactions',
      'audit_logs'
    ];
    
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${result.rows[0].count} records`);
    }
    
    console.log('===========================\n');
  } catch (error) {
    console.error('Could not retrieve statistics:', error.message);
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('===========================================');
  console.log('Fee Intelligence Database Migration Tool');
  console.log('===========================================');
  
  // Verify connection first
  const connected = await verifyConnection();
  if (!connected) {
    console.error('\nMigration aborted due to connection failure.');
    process.exit(1);
  }
  
  let success = true;
  
  // Reset database if requested
  if (shouldReset) {
    success = await resetDatabase();
    if (!success) {
      console.error('\nMigration aborted due to reset failure.');
      process.exit(1);
    }
  }
  
  // Setup schema if requested or after reset
  if (shouldSetup || shouldReset) {
    success = await setupSchema();
    if (!success) {
      console.error('\nMigration aborted due to schema creation failure.');
      process.exit(1);
    }
  }
  
  // Load seed data if requested
  if (shouldSeed) {
    success = await loadSeedData();
    if (!success) {
      console.error('\nWarning: Seed data loading failed, but schema is ready.');
    }
  }
  
  // Display statistics if we have data
  if (shouldSeed || (!shouldSetup && !shouldReset)) {
    await displayStats();
  }
  
  console.log('\n✓ Migration completed successfully!\n');
}

/**
 * Display usage information
 */
function displayUsage() {
  console.log(`
Usage: node src/database/migrate.js [options]

Options:
  --setup       Create database schema
  --seed        Load seed data (requires --setup or existing schema)
  --reset       Drop and recreate schema (WARNING: destroys all data)

Examples:
  node src/database/migrate.js --setup
    Create the database schema

  node src/database/migrate.js --setup --seed
    Create schema and load seed data

  node src/database/migrate.js --reset --seed
    Reset database and load seed data (fresh start)

  node src/database/migrate.js --seed
    Load seed data into existing schema

Environment Variables:
  DB_USER       Database user (default: postgres)
  DB_HOST       Database host (default: localhost)
  DB_NAME       Database name (default: fee_intelligence_db)
  DB_PASSWORD   Database password (default: postgres)
  DB_PORT       Database port (default: 5432)

Note: Set these in your .env file
  `);
}

// Run migration or display usage
if (args.length === 0) {
  displayUsage();
  process.exit(0);
}

migrate()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nUnexpected error:', error);
    pool.end();
    process.exit(1);
  });
