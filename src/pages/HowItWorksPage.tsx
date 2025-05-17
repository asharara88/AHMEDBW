import { motion } from 'framer-motion';
import { Activity, Watch, Brain, MessageCircle, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <Watch className="h-8 w-8" />,
      title: "Connect Your Devices",
      description: "Sync your wearables, health apps, and lab results to get a complete picture of your health.",
      features: ["Wearable devices", "Health apps", "Lab results", "Manual tracking"],
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Our AI analyzes your data to identify patterns and opportunities for optimization.",
      features: ["Pattern recognition", "Trend analysis", "Health insights", "Personalized recommendations"],
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Personalized Coaching",
      description: "Get evidence-based recommendations and guidance from your AI health coach.",
      features: ["24/7 AI coach", "Custom supplement plans", "Lifestyle adjustments", "Progress tracking"],
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Optimize & Improve",
      description: "Track your progress, adjust your approach, and continuously improve your health.",
      features: ["Goal setting", "Progress tracking", "Habit formation", "Continuous optimization"],
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center mb-16"
      >
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">How Biowell Works</h1>
        <p className="text-text-light text-lg">
          Our platform combines cutting-edge technology with evidence-based health science to help you achieve optimal wellness.
        </p>
      </motion.div>

      {/* Process Steps */}
      <div className="mb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
              <p className="mb-4 text-text-light">{step.description}</p>
              <div className="mt-auto space-y-2">
                {step.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Video/Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto max-w-4xl mb-20"
      >
        <div className="aspect-video rounded-xl bg-[hsl(var(--color-card))] shadow-lg overflow-hidden">
          <div className="flex h-full items-center justify-center bg-[hsl(var(--color-card-hover))]">
            <div className="text-center">
              <Activity className="mx-auto h-16 w-16 text-primary/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">Video Demo</h3>
              <p className="text-text-light">Video demonstration coming soon</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mx-auto max-w-6xl mb-20"
      >
        <h2 className="text-2xl font-bold text-center mb-12">Key Benefits</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Evidence-Based</h3>
            <p className="text-text-light">
              All recommendations are backed by scientific research and clinical studies.
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Personalized</h3>
            <p className="text-text-light">
              Tailored recommendations based on your unique health data and goals.
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Comprehensive</h3>
            <p className="text-text-light">
              Addresses all aspects of health: sleep, nutrition, activity, stress, and more.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mx-auto max-w-3xl rounded-xl bg-gradient-to-r from-primary to-secondary p-8 text-center text-white"
      >
        <h2 className="mb-4 text-2xl font-bold">Ready to optimize your health?</h2>
        <p className="mb-6">
          Join thousands of users who have transformed their health journey with Biowell.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-primary transition-colors hover:bg-white/90"
        >
          Get Started Today
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </div>
  );
};

export default HowItWorksPage;