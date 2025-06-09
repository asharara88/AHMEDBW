import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth API mocks
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
    });
  }),

  // Supabase API mocks
  http.get('*/rest/v1/profiles*', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        onboarding_completed: true,
      },
    ]);
  }),

  http.get('*/rest/v1/supplements*', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Magnesium Glycinate',
        description: 'Supports sleep quality and muscle recovery',
        price_aed: 49.99,
        image_url: 'https://example.com/magnesium.jpg',
        categories: ['Sleep', 'Recovery'],
        evidence_level: 'Green',
      },
      {
        id: '2',
        name: 'Vitamin D3',
        description: 'Supports immune function and bone health',
        price_aed: 29.99,
        image_url: 'https://example.com/vitamin-d.jpg',
        categories: ['Immunity', 'Bone Health'],
        evidence_level: 'Green',
      },
    ]);
  }),

  // OpenAI API mocks
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: 'This is a mock response from the OpenAI API.',
          },
        },
      ],
    });
  }),
];