import React, { useState, useEffect } from 'react'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-2xl">🩺</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            BioWell
          </h1>
          <p className="text-xl text-gray-600 mb-2">Your Personal Health Dashboard</p>
          <div className="text-lg text-gray-500">
            {currentTime.toLocaleString()}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Health Score</h2>
            <div className="text-3xl font-bold text-green-600">85%</div>
            <p className="text-gray-600">Overall wellness</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Daily Goals</h2>
            <div className="text-3xl font-bold text-blue-600">4/5</div>
            <p className="text-gray-600">Tasks completed</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Streak</h2>
            <div className="text-3xl font-bold text-purple-600">12</div>
            <p className="text-gray-600">Days active</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">System Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
