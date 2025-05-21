import { useApi } from './useApi';
import { chatApi } from '../api/chatApi';

/**
 * Hook for interacting with the chat API
 */
export function useChatApi() {
  const { loading, error, execute: sendMessageApi } = useApi(
    chatApi.sendMessage,
    { errorMessage: 'Failed to send message' }
  );

  const sendMessage = async (messages: any[], userId?: string) => {
    return sendMessageApi(messages, userId);
  };

  return { sendMessage, loading, error };
}