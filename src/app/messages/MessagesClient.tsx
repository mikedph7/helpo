"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send } from 'lucide-react';

interface Conversation {
  id: number;
  type: string;
  title?: string;
  last_message_at: string;
  participants: Array<{
    user: { id: number; name: string; email: string };
  }>;
  messages: Array<{ id: number; content: string; sender: { name: string }; created_at: string }>;
}

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchConversations(); }, []);

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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newMessage }),
      });
      if (response.ok) {
        setNewMessage(''); fetchMessages(selectedConversation); markAsRead(selectedConversation);
      }
    } catch (error) { console.error('Error sending message:', error); }
  };

  const markAsRead = async (conversationId: number) => { try { await fetch(`/api/messages/${conversationId}/read`, { method: 'POST' }); } catch (error) { console.error('Error marking messages as read:', error); } };

  if (loading) {
    return (
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading conversations...</div></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Messages</h1>
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4"><MessageCircle className="w-16 h-16 mx-auto" /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-6">Chat with service providers about your bookings and requests.</p>
          <a href="/services" className="text-blue-600 hover:text-blue-700 font-medium">Book a Service →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-lg font-medium mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} onClick={() => { setSelectedConversation(conversation.id); fetchMessages(conversation.id); }} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                  <div className="font-medium">{conversation.title || conversation.participants.map(p => p.user.name).join(', ')}</div>
                  {conversation.messages[0] && (<div className="text-sm text-gray-500 truncate">{conversation.messages[0].content}</div>)}
                  <div className="text-xs text-gray-400 mt-1">{new Date(conversation.last_message_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            {selectedConversation ? (
              <div>
                <div className="space-y-2 mb-4">
                  {messages.map(m => (
                    <div key={m.id} className="p-2 border-b"><div className="text-sm">{m.content}</div><div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</div></div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 p-2 border rounded" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write a message..." />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={sendMessage}><Send /></button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Select a conversation to view messages.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
