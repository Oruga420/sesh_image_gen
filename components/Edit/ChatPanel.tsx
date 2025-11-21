'use client';

import { useSessionStore, ChatMessage } from "@/store/useSessionStore";
import { MODELS } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function ChatPanel() {
  const {
    editMessages,
    editPrompt,
    editReferenceImages,
    selectedModel,
    isEditGenerating,
    setEditPrompt,
    addEditMessage,
    setIsEditGenerating,
    addEditReferenceImage,
    clearEditHistory,
  } = useSessionStore();

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

      // Add reference images if supported
      if (model.supportsImageRef && editReferenceImages.length > 0) {
        if (selectedModel === 'nano_banana' || selectedModel === 'nano_banana_pro') {
          input.image_input = editReferenceImages;
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

      // For demo purposes, simulate completion
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          prompt: editPrompt,
          images: [{
            id: Date.now().toString(),
            url: 'https://via.placeholder.com/512x512?text=Edited+Image',
            prompt: editPrompt,
            modelKey: selectedModel,
            timestamp: Date.now(),
            predictionId: prediction.id || 'demo'
          }],
          timestamp: Date.now(),
          modelKey: selectedModel,
          status: 'completed',
        };

        addEditMessage(assistantMessage);
        setIsEditGenerating(false);
      }, 3000);

    } catch (error) {
      console.error('Edit error:', error);
      setIsEditGenerating(false);
    }
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
                        <div className="aspect-square relative rounded overflow-hidden">
                          <Image 
                            src={img.url} 
                            alt="Generated"
                            fill
                            className="object-cover"
                          />
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
                <div key={idx} className="aspect-square relative rounded overflow-hidden">
                  <Image 
                    src={img} 
                    alt={`Ref ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
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
    </div>
  );
}
