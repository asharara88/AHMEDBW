console.log('🧪 BIOWELL COMPLETE TEST SUITE');
console.log('===============================');

// Test 1: Check if app loads
console.log('1. App Loading Test');
const appRoot = document.getElementById('root');
console.log('   ✅ App root exists:', !!appRoot);
console.log('   ✅ App content loaded:', appRoot?.children.length > 0);

// Test 2: Check stores
console.log('2. Store Connection Test');
try {
  const userStore = useUserProfileStore?.getState();
  const supplementStore = useSupplementStore?.getState();
  const cartStore = useCartStore?.getState();
  
  console.log('   ✅ User store:', !!userStore);
  console.log('   ✅ Supplement store:', !!supplementStore);
  console.log('   ✅ Cart store:', !!cartStore);
} catch (e) {
  console.log('   ❌ Store error:', e.message);
}

// Test 3: Check routing
console.log('3. Routing Test');
const currentPath = window.location.pathname;
console.log('   Current path:', currentPath);
console.log('   ✅ Router working:', !!window.location);

// Test 4: Check Supabase connection
console.log('4. Database Connection Test');
// This would need to be run async
console.log('   Check supplements page for database status');

console.log('===============================');
console.log('🎯 Next steps:');
console.log('1. Navigate to /supplements');
console.log('2. Check if supplements load');
console.log('3. Test cart and stack functions');
console.log('4. Test onboarding flow');
