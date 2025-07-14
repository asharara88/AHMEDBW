import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openaiApi } from './openaiApi';
import OpenAI from 'openai';
import { ErrorType } from './apiClient';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

// Mock logger
vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

describe('openaiApi', () => {
  let mockOpenAI: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Get the mocked OpenAI instance
    mockOpenAI = new OpenAI({} as any);
  });

  describe('generateResponse', () => {
    it('should generate a response successfully', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test response',
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      // Act
      const response = await openaiApi.generateResponse('Test prompt');
      
      // Assert
      expect(response).toBe('This is a test response');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.arrayContaining([
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: 'Test prompt' },
          ]),
        })
      );
    });

    it('should include context in the messages when provided', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test response with context',
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      const context = { userId: '123', goal: 'test goal' };
      
      // Act
      const response = await openaiApi.generateResponse('Test prompt', context);
      
      // Assert
      expect(response).toBe('This is a test response with context');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: expect.any(String) },
            { role: 'system', content: expect.stringContaining(JSON.stringify(context)) },
            { role: 'user', content: 'Test prompt' },
          ]),
        })
      );
    });

    it('should return a default message when no content is returned', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      // Act
      const response = await openaiApi.generateResponse('Test prompt');
      
      // Assert
      expect(response).toBe('No response generated');
    });

    it('should throw an ApiError when the API call fails', async () => {
      // Arrange
      const mockError = new Error('API error');
      mockOpenAI.chat.completions.create = vi.fn().mockRejectedValue(mockError);
      
      // Act & Assert
      await expect(openaiApi.generateResponse('Test prompt')).rejects.toMatchObject({
        type: ErrorType.SERVER,
        message: 'API error',
        originalError: mockError,
      });
    });
  });

  describe('processOnboarding', () => {
    it('should process onboarding conversation successfully', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'What is your name?',
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      const messages = [
        { role: 'user', content: 'Hello' },
      ];
      
      // Act
      const response = await openaiApi.processOnboarding(messages);
      
      // Assert
      expect(response).toBe('What is your name?');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.arrayContaining([
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: 'Hello' },
          ]),
        })
      );
    });
  });

  describe('extractOnboardingData', () => {
    it('should extract structured data from conversation', async () => {
      // Arrange
      const mockData = {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        mainGoal: 'improve sleep',
        healthGoals: ['sleep', 'stress'],
        supplementHabits: ['magnesium'],
      };
      
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockData),
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      const messages = [
        { role: 'user', content: 'My name is John Doe' },
        { role: 'assistant', content: 'Nice to meet you, John!' },
      ];
      
      // Act
      const extractedData = await openaiApi.extractOnboardingData(messages);
      
      // Assert
      expect(extractedData).toEqual(mockData);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          temperature: 0,
          response_format: { type: 'json_object' },
        })
      );
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Not valid JSON',
            },
          },
        ],
      };
      
      mockOpenAI.chat.completions.create = vi.fn().mockResolvedValue(mockResponse);
      
      const messages = [
        { role: 'user', content: 'My name is John Doe' },
      ];
      
      // Act & Assert
      await expect(openaiApi.extractOnboardingData(messages)).rejects.toThrow();
    });
  });
});