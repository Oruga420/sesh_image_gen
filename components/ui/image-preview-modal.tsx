'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { X, Download, ExternalLink, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageItem {
  url: string;
  prompt: string;
  modelKey: string;
  timestamp: number;
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  modelNames: Record<string, string | undefined>;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  modelNames,
}: ImagePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // Keyboard: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, goToPrev, goToNext]);

  const handleCopyUrl = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownload = () => {
    if (!current) return;
    const link = document.createElement('a');
    link.href = current.url;
    link.download = `generated-image-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!current) return;
    window.open(current.url, '_blank');
  };

  if (!isOpen || !current) return null;

  const modelName = modelNames[current.modelKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Left Arrow */}
      {hasPrev && (
        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-6 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Right Arrow */}
      {hasNext && (
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-6 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              Image Preview
              <span className="text-sm font-normal text-gray-500 ml-2">
                {currentIndex + 1} / {images.length}
              </span>
            </h3>
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
              src={current.url}
              alt="Generated image preview"
              width={1024}
              height={1024}
              className="max-w-full max-h-[55vh] sm:max-h-[65vh] object-contain rounded-sm"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          {/* Prompt */}
          {current.prompt && (
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt:</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border border-gray-200 dark:border-gray-600 max-h-20 sm:max-h-24 overflow-y-auto">
                {current.prompt}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {current.timestamp && (
                <span>Generated on {new Date(current.timestamp).toLocaleDateString()}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              ← → arrows to navigate • ESC to close
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDownload}
              variant="default"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              <span className="sm:inline">Download</span>
            </Button>

            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </Button>

            <Button
              onClick={handleCopyUrl}
              variant="outline"
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
