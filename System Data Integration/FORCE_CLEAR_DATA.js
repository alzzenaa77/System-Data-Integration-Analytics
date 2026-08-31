// FORCE CLEAR ALL DATA - Paste this in browser console (F12)

console.log('🧹 FORCE CLEARING ALL DATA...');

// 1. Clear localStorage
console.log('Step 1: Clearing localStorage...');
localStorage.clear();
console.log('✅ localStorage cleared');

// 2. Clear sessionStorage
console.log('Step 2: Clearing sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// 3. Clear all cookies
console.log('Step 3: Clearing cookies...');
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

// 4. Force reload without cache
console.log('Step 4: Force reloading page...');
setTimeout(() => {
  location.reload(true);
}, 1000);

console.log('✅ ALL DATA CLEARED! Page will reload in 1 second...');
