// CLEAN DATA UTILITY
// Copy paste script ini ke browser console (F12) untuk clean up corrupt data

// Step 1: Clear localStorage
console.log('Step 1: Clearing localStorage...');
localStorage.clear();
console.log('✓ localStorage cleared');

// Step 2: Refresh page
console.log('Step 2: Please refresh the page now (Ctrl+R or F5)');
console.log('After refresh, you should have clean data with no duplicates');

// Alternative: If you want to keep login but clear data only
// Uncomment lines below and comment out localStorage.clear() above:
/*
const token = localStorage.getItem('token');
const demoUser = localStorage.getItem('demoUser');
localStorage.clear();
if (token) localStorage.setItem('token', token);
if (demoUser) localStorage.setItem('demoUser', demoUser);
console.log('✓ Data cleared, login preserved');
console.log('Please refresh the page');
*/
