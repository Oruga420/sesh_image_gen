'use client';

import { useState, useCallback } from 'react';

interface UseVoiceSearchProps {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceSearch({ onTranscript, onError }: UseVoiceSearchProps = {}) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  // Check if browser supports voice recording
  const checkSupport = useCallback(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      setIsSupported(false);
      return false;
    }

    try {
      const hasMediaDevices = !!navigator.mediaDevices;
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = typeof window !== 'undefined' && 'MediaRecorder' in window;
      
      const supported = hasMediaDevices && hasGetUserMedia && hasMediaRecorder;
      setIsSupported(supported);
      return supported;
    } catch (error) {
      setIsSupported(false);
      return false;
    }
  }, []);

  const handleTranscript = useCallback((text: string) => {
    onTranscript?.(text);
  }, [onTranscript]);

  const handleError = useCallback((error: string) => {
    onError?.(error);
  }, [onError]);

  return {
    isSupported,
    checkSupport,
    handleTranscript,
    handleError
  };
}