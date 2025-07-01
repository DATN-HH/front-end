// Development Authentication Bypass Script
// Only use this in development environment!

console.log('🔧 Development Authentication Bypass');
console.log('⚠️  WARNING: Only use this in development environment!');

// Enable the development bypass
localStorage.setItem('dev_bypass_auth', 'true');

console.log('✅ Development bypass enabled!');
console.log('🔄 Refresh the page to auto-login as admin');
console.log('🌐 Admin URLs available:');
console.log('   - /app/system-admin (System Admin Dashboard)');
console.log('   - /app (General Admin Dashboard)');
console.log('   - /app/system/roles (Role Management)');
console.log('   - /app/system/employees (Employee Management)');
console.log('   - /app/system/branches (Branch Management)');

// Function to disable bypass
window.disableDevBypass = function() {
    localStorage.removeItem('dev_bypass_auth');
    console.log('🛑 Development bypass disabled!');
    console.log('🔄 Refresh the page to return to normal authentication');
};

console.log('💡 To disable bypass later, run: disableDevBypass()'); 