'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { X, Download, ExternalLink, Copy, Check } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  modelName?: string;
  timestamp?: number;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  modelName,
  timestamp
}: ImagePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">Image Preview</h3>
            {modelName && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Generated with {modelName}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative max-h-[60vh] sm:max-h-[70vh] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <div className="flex items-center justify-center min-h-[250px] sm:min-h-[400px] p-2 sm:p-4">
            <Image
              src={imageUrl}
              alt="Generated image preview"
              width={1024}
              height={1024}
              className="max-w-full max-h-[55vh] sm:max-h-[65vh] object-contain rounded-sm"
              priority
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {/* Prompt */}
          {prompt && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border border-gray-200 dark:border-gray-600 max-h-20 sm:max-h-24 overflow-y-auto">
                {prompt}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {timestamp && (
                <span>Generated on {new Date(timestamp).toLocaleDateString()}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Click outside or press ESC to close
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDownload}
              variant="sesh"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              <span className="sm:inline">Download</span>
            </Button>
            
            <Button
              onClick={handleOpenInNewTab}
              variant="seshOutline"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </Button>
            
            <Button
              onClick={handleCopyUrl}
              variant="seshOutline"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="hidden sm:inline">Copied!</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy URL</span>
                  <span className="sm:hidden">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}