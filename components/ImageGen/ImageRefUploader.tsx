'use client';

import { useRef, useEffect, useCallback } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS } from "@/lib/models";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ImageRefUploader() {
  const {
    selectedModel,
    referenceImages,
    addReferenceImage,
    removeReferenceImage
  } = useSessionStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const model = MODELS[selectedModel];
  const supportsImageRef = model.supportsImageRef;

  // Convert a File/Blob to a base64 data URL and add it as a reference image
  const processImageFile = useCallback((file: File | Blob) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        addReferenceImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [addReferenceImage]);

  // Global paste handler (Ctrl+V anywhere on the page)
  useEffect(() => {
    if (!supportsImageRef) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) processImageFile(blob);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [supportsImageRef, processImageFile]);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => processImageFile(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processImageFile(file));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Reference Images
      </label>

      {supportsImageRef ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
        >
          <div className="text-2xl mb-1">📎</div>
          <p className="text-sm text-gray-600 font-medium">
            Click, drag & drop, or <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+V</kbd> to paste
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports multiple images • Paste from clipboard anytime
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center opacity-50">
          <p className="text-sm text-gray-400">🚫 This model doesn't support image references</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!supportsImageRef}
      />

      {referenceImages.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">
              {referenceImages.length} reference{referenceImages.length !== 1 ? 's' : ''} added
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const { setReferenceImages } = useSessionStore.getState();
                setReferenceImages([]);
              }}
              className="text-xs text-red-500 hover:text-red-700 h-auto py-1 px-2"
            >
              Clear all
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {referenceImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-lg border">
                  <Image
                    src={imageUrl}
                    alt={`Reference ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeReferenceImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}