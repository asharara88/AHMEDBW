#!/bin/bash

echo "🎨 CREATING DYNAMIC BIOWELL DESIGN"
echo "================================="

# 1. Create dynamic App.tsx with animations and modern design
echo "1️⃣ Creating dynamic App.tsx..."
cat > src/App.tsx << 'APP_EOF'
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Animate health score
    const scoreTimer = setInterval(() => {
      setHealthScore(prev => prev < 85 ? prev + 1 : 85);
    }, 50);

    return () => {
      clearInterval(timer);
      clearInterval(scoreTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const healthData = [
    {
      id: 1,
      title: "Health Score",
      value: `${healthScore}%`,
      icon: "💚",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      description: "Overall wellness indicator",
      trend: "+5% from last week"
    },
    {
      id: 2,
      title: "Daily Supplements",
      value: "3/5",
      icon: "💊",
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      description: "Supplements taken today",
      trend: "2 remaining"
    },
    {
      id: 3,
      title: "Workout Progress",
      value: "4/5",
      icon: "🏋️",
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      description: "Weekly workout goals",
      trend: "1 day left"
    },
    {
      id: 4,
      title: "Nutrition Score",
      value: "92%",
      icon: "🥗",
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800",
      description: "Daily nutrition target",
      trend: "Excellent!"
    },
    {
      id: 5,
      title: "Sleep Quality",
      value: "7.5h",
      icon: "😴",
      color: "from-indigo-400 to-blue-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-800",
      description: "Last night's sleep",
      trend: "Good quality"
    },
    {
      id: 6,
      title: "Hydration",
      value: "2.1L",
      icon: "💧",
      color: "from-cyan-400 to-teal-500",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-800",
      description: "Water intake today",
      trend: "0.9L to go"
    }
  ];

  const quickActions = [
    { icon: "📊", label: "View Reports", color: "bg-gradient-to-r from-pink-500 to-rose-500" },
    { icon: "⚙️", label: "Settings", color: "bg-gradient-to-r from-gray-500 to-slate-500" },
    { icon: "🎯", label: "Goals", color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
    { icon: "🔔", label: "Reminders", color: "bg-gradient-to-r from-red-500 to-pink-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🩺</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            BioWell
          </h1>
          <p className="text-xl text-gray-600 mb-2">Your Personal Health Dashboard</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {formatDate(currentTime)}
            </span>
            <span className="text-2xl font-mono text-gray-700">{formatTime(currentTime)}</span>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${action.color} text-white text-sm font-medium hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Health Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {healthData.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                activeCard === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
              onMouseEnter={() => setActiveCard(item.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
                    <div className={`text-sm font-medium ${item.textColor}`}>
                      {item.trend}
                    </div>
                  </div>
                  
                  {/* Progress Ring for Health Score */}
                  {item.id === 1 && (
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-green-100"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${healthScore * 1.76} 176`}
                          className="text-green-500 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">{healthScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Weekly Overview</h2>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-1000"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse animation-delay-2000"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-gray-500 mb-2">{day}</div>
                <div className={`w-full h-24 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-105 ${
                  index < 4 ? 'bg-gradient-to-t from-green-400 to-green-500 text-white shadow-lg' : 
                  index === 4 ? 'bg-gradient-to-t from-blue-400 to-blue-500 text-white shadow-lg' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {index < 5 ? '✅' : '⭕'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            BioWell - Empowering your health journey with intelligent insights
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
APP_EOF

echo "✅ Dynamic App.tsx created!"
