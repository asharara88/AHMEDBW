import { motion } from 'framer-motion';
import PricingSection from '../components/common/PricingSection';
import { HelpCircle } from 'lucide-react';

const PricingPage = () => {
  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, Apple Pay, Samsung Pay, and popular UAE digital wallets.',
    },
    {
      question: 'Is there a long-term commitment?',
      answer: 'No, all plans are subscription-based and can be cancelled at any time.',
    },
    {
      question: 'Do you offer team or family plans?',
      answer: 'Yes, our Enterprise plan is designed for teams. For family plans, please contact our sales team.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center mb-12"
      >
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Choose Your Health Optimization Plan</h1>
        <p className="text-text-light">
          Select the plan that best fits your wellness journey and goals
        </p>
      </motion.div>

      <PricingSection />

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto mt-16 max-w-3xl"
      >
        <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-medium">{faq.question}</h3>
                  <p className="text-text-light">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PricingPage;