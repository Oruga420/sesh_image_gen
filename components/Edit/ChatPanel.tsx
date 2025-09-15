'use client';

import { useState } from "react";
import { useSessionStore, ChatMessage } from "@/store/useSessionStore";
import { MODELS } from "@/lib/models/registry";
import { getAspectRatioForModel, getCustomDimensionsForModel } from "@/lib/utils/aspectRatio";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImagePreviewModal from "@/components/ui/image-preview-modal";
import Image from "next/image";

export default function ChatPanel() {
  const {
    editMessages,
    editPrompt,
    editReferenceImages,
    selectedModel,
    aspectRatio,
    isEditGenerating,
    setEditPrompt,
    addEditMessage,
    setIsEditGenerating,
    addEditReferenceImage,
    clearEditHistory,
  } = useSessionStore();

  const [previewImage, setPreviewImage] = useState<{
    url: string;
    prompt: string;
    modelKey: string;
    timestamp: number;
  } | null>(null);

  const handleImageClick = (imageUrl: string, prompt: string, modelKey: string, timestamp: number) => {
    setPreviewImage({ url: imageUrl, prompt, modelKey, timestamp });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleSubmit = async () => {
    if (!editPrompt.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      prompt: editPrompt,
      images: [],
      referenceImages: [...editReferenceImages],
      timestamp: Date.now(),
      modelKey: selectedModel,
      status: 'generating',
    };

    addEditMessage(userMessage);
    setEditPrompt('');
    setIsEditGenerating(true);

    try {
      // Prepare input for the model
      const model = MODELS[selectedModel];
      const input: Record<string, any> = {
        prompt: editPrompt,
      };

      // Add aspect ratio support
      const aspectRatioValue = getAspectRatioForModel(aspectRatio, selectedModel);
      const customDimensions = getCustomDimensionsForModel(aspectRatio, selectedModel);
      
      if (aspectRatioValue !== '1:1') { // Only add if not default square
        input.aspect_ratio = aspectRatioValue;
      }
      
      // Add custom dimensions if the model supports it
      if (customDimensions.width && customDimensions.height) {
        input.width = customDimensions.width;
        input.height = customDimensions.height;
        if (selectedModel === 'flux_1_1_pro') {
          input.aspect_ratio = 'custom'; // FLUX needs this for custom dimensions
        }
      }

      // Add reference images if supported
      if (model.supportsImageRef && editReferenceImages.length > 0) {
        if (selectedModel === 'nano_banana' || selectedModel === 'seedream4') {
          input.image_input = editReferenceImages;
        } else if (selectedModel === 'flux_1_1_pro') {
          input.image_prompt = editReferenceImages[0]; // FLUX uses single image_prompt
        }
      }

      // Create prediction
      const response = await fetch('/api/replicate/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelKey: selectedModel,
          input
        })
      });

      const prediction = await response.json();
      
      if (prediction.error) {
        throw new Error(prediction.error);
      }

      // Poll for prediction completion
      pollPrediction(prediction.id, editPrompt);

    } catch (error) {
      console.error('Edit error:', error);
      setIsEditGenerating(false);
    }
  };

  const pollPrediction = async (predictionId: string, originalPrompt: string) => {
    const startTime = Date.now();
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max
    let pollCount = 0;
    
    // Poll our backend endpoint instead of Replicate directly
    const poll = async () => {
      try {
        pollCount++;
        const elapsed = Date.now() - startTime;
        
        // Check for timeout
        if (elapsed > maxWaitTime) {
          throw new Error('Generation timed out after 10 minutes. The model may be overloaded or the request may be too complex.');
        }
        
        const response = await fetch(`/api/replicate/status/${predictionId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const prediction = await response.json();
        
        // Debug logging
        console.log(`Poll ${pollCount} for ${predictionId}: ${prediction.status}`, prediction);
        console.log(`Poll ${pollCount} - Output:`, prediction.output);
        console.log(`Poll ${pollCount} - Error:`, prediction.error);
        
        if (prediction.error) {
          throw new Error(prediction.error);
        }
        
        if (prediction.status === 'succeeded') {
          console.log(`SUCCESS! Prediction ${predictionId} completed`);
          console.log('Raw output:', prediction.output);
          console.log('Output type:', typeof prediction.output);
          console.log('Is array:', Array.isArray(prediction.output));
          
          if (!prediction.output) {
            console.error('No output in successful prediction!');
            throw new Error('Prediction succeeded but no output was returned');
          }
          
          // Handle successful completion
          const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
          console.log('Extracted image URL:', imageUrl);
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            prompt: originalPrompt,
            images: [{
              id: Date.now().toString(),
              url: imageUrl,
              prompt: originalPrompt,
              modelKey: selectedModel,
              timestamp: Date.now(),
              predictionId: predictionId
            }],
            timestamp: Date.now(),
            modelKey: selectedModel,
            status: 'completed',
          };

          console.log('Adding message to chat:', assistantMessage);
          addEditMessage(assistantMessage);
          setIsEditGenerating(false);
          console.log('Image should now appear in chat!');
        } else if (prediction.status === 'failed') {
          throw new Error(`Generation failed: ${prediction.error || 'Unknown error'}`);
        } else if (prediction.status === 'canceled') {
          throw new Error('Generation was canceled');
        } else {
          // Still in progress, poll again after delay
          // Increase polling interval for long-running predictions
          const delay = pollCount > 30 ? 5000 : 2000; // 5s after 1 minute, 2s before
          setTimeout(() => poll(), delay);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          prompt: originalPrompt,
          images: [],
          timestamp: Date.now(),
          modelKey: selectedModel,
          status: 'failed',
        };
        
        addEditMessage({
          ...errorMessage,
          prompt: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        });
        setIsEditGenerating(false);
      }
    };
    
    // Start polling with initial delay
    setTimeout(() => poll(), 1000);
  };

  const handleImageRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          addEditReferenceImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const model = MODELS[selectedModel];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Edit Chat</h2>
          <p className="text-sm text-gray-500">Model: {model.name}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearEditHistory}
          disabled={editMessages.length === 0}
        >
          Clear History
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {editMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🎨</div>
            <p>Start a conversation to edit and generate images</p>
            <p className="text-sm mt-2">All history will be cleared on page reload</p>
          </div>
        ) : (
          editMessages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100'
                }`}
              >
                <p className="text-sm mb-2">{message.prompt}</p>
                
                {/* Reference images */}
                {message.referenceImages && message.referenceImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {message.referenceImages.map((img, idx) => (
                      <div key={idx} className="aspect-square relative rounded overflow-hidden">
                        <Image 
                          src={img} 
                          alt={`Reference ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Generated images */}
                {message.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {message.images.map((img) => (
                      <div key={img.id} className="relative">
                        <div 
                          className="aspect-square relative rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                          onClick={() => handleImageClick(img.url, message.prompt, message.modelKey, message.timestamp)}
                        >
                          <Image 
                            src={img.url} 
                            alt="Generated"
                            fill
                            className="object-cover"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded text-sm font-medium">
                              Click to preview
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={img.url} download target="_blank">
                              Download
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => addEditReferenceImage(img.url)}
                          >
                            Use as Ref
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-75 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()} • {message.status}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isEditGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm">Generating...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {/* Reference Images Display */}
        {editReferenceImages.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Reference Images:</p>
            <div className="grid grid-cols-4 gap-2">
              {editReferenceImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square relative rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                  onClick={() => handleImageClick(img, 'Reference image', selectedModel, Date.now())}
                >
                  <Image 
                    src={img} 
                    alt={`Ref ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Hover overlay for reference images */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                      Preview
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Describe how you want to edit or generate an image..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <div className="flex justify-between">
            <div className="flex gap-2">
              {model.supportsImageRef && (
                <Button variant="outline" size="sm" asChild>
                  <label>
                    📎 Add Ref
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageRefUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              )}
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isEditGenerating || !editPrompt.trim()}
            >
              {isEditGenerating ? "Generating..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={closePreview}
        imageUrl={previewImage?.url || ''}
        prompt={previewImage?.prompt}
        modelName={previewImage ? MODELS[previewImage.modelKey]?.name : undefined}
        timestamp={previewImage?.timestamp}
      />
    </div>
  );
}