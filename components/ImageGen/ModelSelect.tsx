'use client';

import { useState, useRef, useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, ModelKey, getModelsList } from "@/lib/models/registry";
import VoiceRecorder from "@/components/VoiceSearch/VoiceRecorder";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

export default function ModelSelect() {
  const { selectedModel, setSelectedModel } = useSessionStore();
  const models = getModelsList();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter models based on search query
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle model selection
  const handleSelectModel = (modelKey: ModelKey) => {
    setSelectedModel(modelKey);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Voice search integration
  const { handleTranscript, handleError } = useVoiceSearch({
    onTranscript: (text: string) => {
      setSearchQuery(text);
      setIsDropdownOpen(true);
      setHighlightedIndex(-1);
      // Focus the input after transcription
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error: string) => {
      console.error('Voice search error:', error);
      // Silently handle errors to not break the UI
    }
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredModels.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredModels.length) {
          handleSelectModel(filteredModels[highlightedIndex].key as ModelKey);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected model info
  const selectedModelInfo = selectedModel ? models.find(m => m.key === selectedModel) : null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Select Model
      </label>
      
      <div className="flex gap-3">
        {/* Traditional Dropdown */}
        <div className="flex-1">
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelKey)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {models.map((model) => (
              <option key={model.key} value={model.key}>
                {model.name} - ${(model.costPerImage / 100).toFixed(3)} per image
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <div className="relative flex">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search models or speak..."
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-10"
            />
            <div className="absolute inset-y-0 right-14 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Voice Recording Button - Isolated Component */}
            <VoiceRecorder
              onTranscript={handleTranscript}
              onError={handleError}
              className="border-l-0"
            />
          </div>

          {/* Dropdown Results */}
          {isDropdownOpen && filteredModels.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredModels.map((model, index) => (
                <div
                  key={model.key}
                  onClick={() => handleSelectModel(model.key as ModelKey)}
                  className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    index === highlightedIndex 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  } ${selectedModel === model.key ? 'bg-blue-100' : ''}`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(model.costPerImage / 100).toFixed(3)} per image • {model.description.substring(0, 80)}...
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    {model.supportsImageRef && <span className="text-green-600">📷 Image Ref</span>}
                    {model.supportsEdit && <span className="text-blue-600">✏️ Edit</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {isDropdownOpen && searchQuery && filteredModels.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <div className="text-sm text-gray-500">No models found matching "{searchQuery}"</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Model Info */}
      {selectedModelInfo && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-gray-900">{selectedModelInfo.name}</h3>
            <span className="text-sm font-medium text-green-600">
              ${(selectedModelInfo.costPerImage / 100).toFixed(3)} per image
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {selectedModelInfo.description}
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className={selectedModelInfo.supportsImageRef ? "text-green-600" : "text-red-500"}>
                {selectedModelInfo.supportsImageRef ? "✓" : "✗"}
              </span>
              Image Refs
            </span>
            <span className="flex items-center gap-1">
              <span className={selectedModelInfo.supportsEdit ? "text-green-600" : "text-red-500"}>
                {selectedModelInfo.supportsEdit ? "✓" : "✗"}
              </span>
              Edit Support
            </span>
            <span>
              Default: {selectedModelInfo.defaultSize}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}