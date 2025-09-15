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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-6xl max-h-[95vh] mx-4 bg-white rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
            {modelName && (
              <p className="text-sm text-gray-600">Generated with {modelName}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative max-h-[70vh] overflow-hidden bg-gray-100">
          <div className="flex items-center justify-center min-h-[400px]">
            <Image
              src={imageUrl}
              alt="Generated image preview"
              width={1024}
              height={1024}
              className="max-w-full max-h-[70vh] object-contain"
              priority
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          {/* Prompt */}
          {prompt && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                {prompt}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-gray-500">
              {timestamp && (
                <span>Generated on {new Date(timestamp).toLocaleString()}</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Click outside or press ESC to close
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleDownload}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}