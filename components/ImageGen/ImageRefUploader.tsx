'use client';

import { useRef } from "react";
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
  const model = MODELS[selectedModel];
  const supportsImageRef = model.supportsImageRef;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          addReferenceImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
    
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
      
      <Button 
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={!supportsImageRef}
        className={!supportsImageRef ? "opacity-50 cursor-not-allowed" : ""}
      >
        {supportsImageRef ? "📎 Add Reference" : "🚫 Not Supported"}
      </Button>
      
      {!supportsImageRef && (
        <p className="text-xs text-gray-500 mt-1">
          This model doesn't support image references
        </p>
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
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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
      )}
    </div>
  );
}