const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in seed.sql for all test users');
}

generateHash();
