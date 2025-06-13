# Biowell AI - Personal Digital Health Coach

[![Netlify Status](https://api.netlify.com/api/v1/badges/5239b3f1-f78c-4857-ad9d-ad1bb351d322/deploy-status)](https://app.netlify.com/projects/biowellai/deploys)

Biowell AI is a digital health platform that connects your wearable devices, delivers personalized insights, and offers evidence‑based supplement recommendations through an AI coach.

## Features

- **Personal Health Dashboard**: View your health score and metrics from connected wearable devices
- **AI Health Coach**: Chat with an AI powered by OpenAI to get personalized health advice
- **Supplement Recommendations**: Receive custom supplement suggestions based on your health data
- **Onboarding Quiz**: Detailed health assessment to personalize your experience
- **Wearable Integration**: Connect with Apple Health, Oura Ring, Garmin, and more
- **Subscription Management**: Subscribe to recommended supplements for monthly delivery

> **Disclaimer**: Biowell AI does not provide medical diagnosis or treatment. The AI coach offers general wellness guidance based on the information you share. Always consult a qualified healthcare professional for medical concerns.

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

3. Copy `.env.example` to `.env` and add your credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_CAPTCHA_SECRET_KEY=your-captcha-secret-key # optional
```

4. For production builds, copy `.env.production.example` to `.env.production` and supply your production values (this file is ignored by Git).

5. Start the development server:

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

### Audio Cache Table

The migrations include an `audio_cache` table used to store generated audio for
text-to-speech responses. It features indexes on `(user_id, cache_key)` and
`expires_at` for quick lookups, row level security policies that restrict access
to authenticated users, and a trigger that automatically removes expired
entries.

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

## Deployment

The `netlify.toml` file specifies a Node.js 18 environment and uses the
`netlify-plugin-fetch-feeds` plugin to download the latest Hacker News front
page into `public/feeds/hn.xml` during each build.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
