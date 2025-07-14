const fs = require('fs');
const filePath = 'src/components/supplements/SupplementFilters.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix aria-pressed boolean expressions
content = content.replace(/aria-pressed=\{!selectedCategory\}/g, 'aria-pressed={(!selectedCategory).toString()}');
content = content.replace(/aria-pressed=\{selectedCategory === category\}/g, 'aria-pressed={(selectedCategory === category).toString()}');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed SupplementFilters.tsx');
