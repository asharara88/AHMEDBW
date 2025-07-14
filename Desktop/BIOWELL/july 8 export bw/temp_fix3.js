const fs = require('fs');
const filePath = 'src/pages/auth/OnboardingPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all onboardingType comparisons
content = content.replace(/aria-pressed=\{onboardingType === 'conversational'\}/g, 'aria-pressed={(onboardingType === \'conversational\').toString()}');
content = content.replace(/aria-pressed=\{onboardingType === 'form'\}/g, 'aria-pressed={(onboardingType === \'form\').toString()}');
content = content.replace(/aria-pressed=\{onboardingType === 'enhanced'\}/g, 'aria-pressed={(onboardingType === \'enhanced\').toString()}');
content = content.replace(/aria-pressed=\{onboardingType === 'streamlined'\}/g, 'aria-pressed={(onboardingType === \'streamlined\').toString()}');

fs.writeFileSync(filePath, content);
console.log('✅ Fixed OnboardingPage.tsx');
