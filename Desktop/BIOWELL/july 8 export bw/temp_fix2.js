const fs = require('fs');
const filePath = 'src/components/dashboard/HealthDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all timeRange comparisons
content = content.replace(/aria-pressed=\{timeRange === 'day'\}/g, 'aria-pressed={(timeRange === \'day\').toString()}');
content = content.replace(/aria-pressed=\{timeRange === 'week'\}/g, 'aria-pressed={(timeRange === \'week\').toString()}');
content = content.replace(/aria-pressed=\{timeRange === 'month'\}/g, 'aria-pressed={(timeRange === \'month\').toString()}');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed HealthDashboard.tsx');
