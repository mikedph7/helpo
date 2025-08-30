import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface MessageProviderData {
  providerId?: number;
  providerUserId?: number;
  bookingId?: number;
  title?: string;
}

export function useMessageProvider() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createConversation = async (data: MessageProviderData) => {
    setLoading(true);
    try {
      let participantId = data.providerUserId;
      
      // If we don't have the providerUserId, get it from the provider ID
      if (!participantId && data.providerId) {
        const response = await fetch(`/api/providers/${data.providerId}/user`);
        if (response.ok) {
          const providerData = await response.json();
          participantId = providerData.userId;
        } else {
          throw new Error('Provider user account not found');
        }
      }

      if (!participantId) {
        throw new Error('Provider user ID not found');
      }

      const response = await fetch('/api/messages/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          bookingId: data.bookingId,
          title: data.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      const conversation = await response.json();
      
      // Navigate to messages page with the conversation selected
      router.push(`/messages?conversation=${conversation.id}`);
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createConversation,
    loading,
  };
}
