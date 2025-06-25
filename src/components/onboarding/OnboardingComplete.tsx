import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingCompleteProps {
  firstName?: string;
  redirectTo?: string;
}

const OnboardingComplete = ({ firstName = 'there', redirectTo = '/dashboard' }: OnboardingCompleteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-[hsl(var(--color-card))] p-8 text-center shadow-lg"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>
      
      <h2 className="mb-4 text-2xl font-bold">Profile Complete!</h2>
      
      <p className="mb-6 text-text-light">
        Thanks {firstName}! Your profile has been set up successfully. We've created a personalized health plan based on your information.
      </p>
      
      <div className="mb-8">
        <div className="mb-2 text-sm font-medium">What's next?</div>
        <ul className="space-y-2 text-left">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
            <span>Explore your personalized dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
            <span>Chat with your AI health coach</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
            <span>Review your supplement recommendations</span>
          </li>
        </ul>
      </div>
      
      <Link
        to={redirectTo}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Go to Dashboard
        <ArrowRight className="h-5 w-5" />
      </Link>
    </motion.div>
  );
};

export default OnboardingComplete;