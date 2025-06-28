import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        About Us
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 text-text"
      >
        <p>Welcome to Biowell</p>
        <p>
          At Biowell, we're dedicated to transforming personal wellness through
          precision, personalization, and proactive health management. We
          leverage advanced AI technology, robust scientific research, and
          intuitive data integration to empower individuals on their unique
          wellness journeys.
        </p>
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p>
          Our mission is to simplify wellness optimization, making evidence-based
          health insights accessible, actionable, and personalized for everyone.
          We strive to empower you to understand your body better, improve your
          health consistently, and achieve your wellness goals sustainably.
        </p>
        <h2 className="text-2xl font-semibold">Our Vision</h2>
        <p>
          We envision a future where health optimization is seamlessly integrated
          into daily life. Biowell is committed to leading this change, creating
          an ecosystem where precise health data, cutting-edge science, and
          intuitive technology intersect to inspire healthier lifestyles.
        </p>
        <h2 className="text-2xl font-semibold">What Makes Biowell Unique</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Precision Health Recommendations:</strong> Leveraging
            advanced analytics and real-time health data to provide highly
            personalized recommendations.
          </li>
          <li>
            <strong>Seamless Integration:</strong> Effortless connectivity with
            your favorite wearables, health apps, and personal preferences.
          </li>
          <li>
            <strong>Scientific Integrity:</strong> Every recommendation and
            feature is backed by rigorous scientific validation to ensure
            effectiveness and safety.
          </li>
          <li>
            <strong>User-Centric Design:</strong> Intuitive, interactive, and
            visually engaging interfaces designed for optimal user experience.
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default AboutPage;
