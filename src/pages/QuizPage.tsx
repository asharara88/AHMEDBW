import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Shield } from 'lucide-react';
import { useAuthStore } from '../store';
import Logo from '../components/common/Logo';

const QuizPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();

  const questions = [
    {
      id: 'goal',
      question: "What's your top health goal?",
      options: ['Improve Sleep', 'Increase Energy', 'Build Muscle', 'Reduce Stress', 'Optimize Metabolism'],
      type: 'single'
    },
    {
      id: 'sleep',
      question: "How many hours do you sleep on average?",
      options: ['Less than 5', '5-6', '7-8', 'More than 8'],
      type: 'single'
    },
    {
      id: 'exercise',
      question: "How often do you exercise?",
      options: ['Rarely', '1-2 times/week', '3-4 times/week', '5+ times/week'],
      type: 'single'
    },
    {
      id: 'supplements',
      question: "Which supplements are you currently taking?",
      options: ['Vitamin D', 'Magnesium', 'Fish Oil', 'Protein', 'Creatine', 'None'],
      type: 'multiple'
    }
  ];

  const currentQuestion = questions[step];

  const handleSingleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
    if (currentQuestion.id === 'goal') {
      localStorage.setItem('goal', option);
    }
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleMultipleSelect = (option: string) => {
    const currentSelections = answers[currentQuestion.id] as string[] || [];
    
    if (currentSelections.includes(option)) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentSelections.filter(item => item !== option)
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentSelections, option]
      });
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would save this data to your backend
      console.log('Submitting answers:', answers);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile with quiz data
      if (user) {
        await updateProfile({
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
          healthGoals: [answers.goal as string],
          onboardingCompleted: true
        });
      }
      
      // Navigate to stack page with the selected goal
      navigate(`/stack?goal=${encodeURIComponent(answers.goal as string)}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-alt px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 h-8" />
          <h1 className="text-2xl font-bold text-text">Health Assessment</h1>
          <p className="mt-2 text-text-light">
            Help us personalize your health recommendations
          </p>
        </div>
        
        <motion.div
          key={`question-${step}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-lg"
        >
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Question {step + 1} of {questions.length}</span>
              <span className="text-text-light">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--color-surface-1))]">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <h2 className="mb-6 text-xl font-semibold">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.type === 'single' ? (
              // Single select options
              currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleSelect(option)}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-[hsl(var(--color-border))] hover:border-primary/50'
                  }`}
                >
                  <span>{option}</span>
                  {answers[currentQuestion.id] === option && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))
            ) : (
              // Multiple select options
              <>
                {currentQuestion.options.map((option) => {
                  const isSelected = (answers[currentQuestion.id] as string[] || []).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleMultipleSelect(option)}
                      className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-[hsl(var(--color-border))] hover:border-primary/50'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  );
                })}
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        {step === questions.length - 1 ? 'Complete' : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
          
          {currentQuestion.type === 'single' && (
            <div className="mt-6">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          )}
        </motion.div>
        
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-xs text-text-light">
          <Shield className="h-4 w-4 text-primary" />
          <p>
            Your health information is private and secure. We use this data to personalize your experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;