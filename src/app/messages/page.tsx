export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send } from 'lucide-react';

interface Conversation {
  id: number;
  type: string;
  title?: string;
  last_message_at: string;
  participants: Array<{
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  messages: Array<{
    id: number;
    content: string;
    sender: {
      name: string;
    };
    created_at: string;
  }>;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const id = parseInt(conversationId, 10);
      if (conversations.find(c => c.id === id)) {
        setSelectedConversation(id);
        fetchMessages(id);
      }
    }
  }, [searchParams, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation);
        // Mark messages as read when sending
        markAsRead(selectedConversation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId: number) => {
    try {
      await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const editMessage = async (messageId: number, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });

      if (response.ok) {
        // Refresh messages
        if (selectedConversation) {
          fetchMessages(selectedConversation);
        }
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/message/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh messages
        if (selectedConversation) {
          fetchMessages(selectedConversation);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const createConversation = async (participantId: number, title?: string) => {
    try {
      const response = await fetch('/api/messages/create-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          title,
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversations(prev => [conversation, ...prev]);
        setSelectedConversation(conversation.id);
        fetchMessages(conversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
        Messages
      </h1>
      
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-6">Chat with service providers about your bookings and requests.</p>
          <a href="/services" className="text-blue-600 hover:text-blue-700 font-medium">
            Book a Service →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-medium mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    fetchMessages(conversation.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">
                    {conversation.title || 
                     conversation.participants
                       .map(p => p.user.name)
                       .join(', ')}
                  </div>
                  {conversation.messages[0] && (
                    <div className="text-sm text-gray-500 truncate">
                      {conversation.messages[0].content}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.last_message_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages View */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <div className="flex flex-col h-96">
                <h2 className="text-lg font-medium mb-4">Messages</h2>
                
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.sender.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
