import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const scoreTimer = setInterval(() => {
      setHealthScore(prev => prev < 85 ? prev + 1 : 85);
    }, 50);

    return () => {
      clearInterval(timer);
      clearInterval(scoreTimer);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
          borderRadius: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🩺</span>
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          BioWell
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Your Personal Health Dashboard
        </p>
        
        <div style={{ fontSize: '1.125rem', color: '#9ca3af' }}>
          {currentTime.toLocaleString()}
        </div>
      </header>

      {/* Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1rem'
        }}>
          {[
            { icon: "📊", label: "Reports", color: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)" },
            { icon: "⚙️", label: "Settings", color: "linear-gradient(135deg, #6b7280 0%, #64748b 100%)" },
            { icon: "🎯", label: "Goals", color: "linear-gradient(135deg, #eab308 0%, #f97316 100%)" },
            { icon: "🔔", label: "Alerts", color: "linear-gradient(135deg, #ef4444 0%, #ec4899 100%)" }
          ].map((action, index) => (
            <button
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: action.color,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {[
          {
            title: "Health Score",
            value: `${healthScore}%`,
            icon: "💚",
            color: "#22c55e",
            bgColor: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
          },
          {
            title: "Daily Supplements",
            value: "3/5",
            icon: "💊",
            color: "#3b82f6",
            bgColor: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
          },
          {
            title: "Workout Progress",
            value: "4/5",
            icon: "🏋️",
            color: "#9333ea",
            bgColor: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
          },
          {
            title: "Nutrition Score",
            value: "92%",
            icon: "🥗",
            color: "#f97316",
            bgColor: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
          },
          {
            title: "Sleep Quality",
            value: "7.5h",
            icon: "😴",
            color: "#6366f1",
            bgColor: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
          },
          {
            title: "Hydration",
            value: "2.1L",
            icon: "💧",
            color: "#06b6d4",
            bgColor: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)"
          }
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: item.bgColor,
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  {item.title}
                </h3>
              </div>
            </div>
            
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: item.color, marginBottom: '0.5rem' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Overview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
          Weekly Overview
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                {day}
              </div>
              <div style={{
                width: '100%',
                height: '6rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                background: index < 5 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                color: index < 5 ? 'white' : '#9ca3af'
              }}>
                {index < 5 ? '✅' : '⭕'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
