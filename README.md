# Biowell AI - Personal Digital Health Coach

[![Netlify Status](https://api.netlify.com/api/v1/badges/5239b3f1-f78c-4857-ad9d-ad1bb351d322/deploy-status)](https://app.netlify.com/projects/biowellai/deploys)

Biowell AI is a comprehensive digital health platform that connects your wearable devices, provides personalized health insights, and offers evidence-based supplement recommendations through an AI coach.

## Features

- **Personal Health Dashboard**: View your health score and metrics from connected wearable devices
- **AI Health Coach**: Chat with an AI powered by OpenAI to get personalized health advice
- **Supplement Recommendations**: Receive custom supplement suggestions based on your health data
- **Onboarding Quiz**: Detailed health assessment to personalize your experience
- **Wearable Integration**: Connect with Apple Health, Oura Ring, Garmin, and more
- **Subscription Management**: Subscribe to recommended supplements for monthly delivery

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Supabase (Authentication, Database, Realtime)
- **Serverless**: Supabase Edge Functions for OpenAI proxy
- **Payments**: Stripe integration (stub for subscription handling)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (for AI coach functionality)
- Stripe account (for payment processing)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/biowell-ai.git
cd biowell-ai
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

4. Start the development server:

```bash
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from the `supabase/migrations` folder
3. Set up authentication with email/password
4. Deploy the Edge Function for OpenAI proxy:

```bash
supabase functions deploy openai-proxy
```

5. Set the OpenAI API key as a secret:

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

6. Set the JWT secret used for verifying Auth tokens:
```bash
supabase secrets set SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

## Project Structure

```
/components      // UI components 
/contexts        // React context providers
/hooks          // Custom React hooks
/pages          // Application pages
/supabase       // Supabase-related files
  /functions    // Edge Functions 
  /migrations   // SQL migration files
/utils          // Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.