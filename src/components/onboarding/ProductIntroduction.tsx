import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageCircle, Package, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductIntroductionProps {
  onComplete: () => void;
}

const ProductIntroduction = ({ onComplete }: ProductIntroductionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Your Personal Health Dashboard",
      description: "See all your health metrics in one place, updated in real-time from your connected devices.",
      action: "Explore your dashboard",
      icon: <Activity className="h-8 w-8" />
    },
    {
      title: "AI Health Coach",
      description: "Get personalized advice and answers to your health questions 24/7 from your AI coach.",
      action: "Chat with your coach",
      icon: <MessageCircle className="h-8 w-8" />
    },
    {
      title: "Custom Supplement Recommendations",
      description: "Receive evidence-based supplement suggestions tailored to your specific health needs and goals.",
      action: "View your recommendations",
      icon: <Package className="h-8 w-8" />
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="rounded-xl bg-[hsl(var(--color-card))] p-6">
      <motion.div
        key={`intro-${currentStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            {steps[currentStep].icon}
          </div>
        </div>
        
        <h3 className="mb-2 text-xl font-bold">{steps[currentStep].title}</h3>
        <p className="mb-6 text-text-light">{steps[currentStep].description}</p>
        
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            className={`flex items-center rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text ${
              currentStep === 0 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center rounded-lg bg-primary px-6 py-3 text-white"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : steps[currentStep].action}
            <ChevronRight className="ml-1 h-5 w-5" />
          </button>
        </div>
      </motion.div>
      
      <div className="mt-6 flex justify-center gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentStep ? 'bg-primary' : 'bg-[hsl(var(--color-border))]'
            }`}
            onClick={() => setCurrentStep(index)}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductIntroduction;