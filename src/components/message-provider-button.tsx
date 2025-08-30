'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessageProvider, type MessageProviderData } from '@/hooks/use-message-provider';
import { useState } from 'react';

interface MessageProviderButtonProps {
  data: MessageProviderData;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function MessageProviderButton({ 
  data, 
  variant = 'outline', 
  size = 'md',
  className = '',
  children 
}: MessageProviderButtonProps) {
  const { createConversation, loading } = useMessageProvider();
  const [error, setError] = useState<string | null>(null);

  const handleMessageProvider = async () => {
    try {
      setError(null);
      await createConversation(data);
    } catch (error: any) {
      setError(error.message || 'Failed to start conversation');
      console.error('Failed to start conversation:', error);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div className="relative">
      <Button
        onClick={handleMessageProvider}
        variant={error ? 'destructive' : variant}
        disabled={loading}
        className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Starting chat...
          </>
        ) : error ? (
          <>
            <MessageCircle className="w-4 h-4" />
            Error - Try again
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            {children || 'Message Provider'}
          </>
        )}
      </Button>
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-100 text-red-800 text-xs rounded border z-50">
          {error}
        </div>
      )}
    </div>
  );
}
