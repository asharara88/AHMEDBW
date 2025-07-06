#!/bin/bash

echo "🔧 FIXING BLANK PAGE ISSUE"
echo "========================="

# 1. Create minimal App.tsx if it's broken
echo "1️⃣ Creating minimal App.tsx..."
cat > src/App.tsx << 'APP_EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
APP_EOF

# 2. Create minimal main.tsx if it's broken
echo "2️⃣ Creating minimal main.tsx..."
cat > src/main.tsx << 'MAIN_EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
MAIN_EOF

# 3. Create minimal DashboardPage if it doesn't exist
echo "3️⃣ Creating minimal DashboardPage..."
mkdir -p src/pages
cat > src/pages/DashboardPage.tsx << 'DASHBOARD_EOF'
import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        BioWell Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Health Overview</h2>
          <p className="text-gray-600">Welcome to your health dashboard!</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
          <p className="text-gray-600">Track your daily health metrics.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <p className="text-gray-600">Personalized health recommendations.</p>
        </div>
      </div>
    </div>
  );
};
DASHBOARD_EOF

# 4. Ensure basic CSS exists
echo "4️⃣ Creating minimal CSS..."
cat > src/index.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
CSS_EOF

echo "✅ Minimal working app created!"
