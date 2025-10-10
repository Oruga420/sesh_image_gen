'use client';

import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, ModelKey, getModelsList } from "@/lib/models";

export default function ModelSelect() {
  const { selectedModel, setSelectedModel } = useSessionStore();
  const models = getModelsList();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Select Model
      </label>
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
      
      {selectedModel && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {MODELS[selectedModel].description}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>
              Image Refs: {MODELS[selectedModel].supportsImageRef ? "✓" : "✗"}
            </span>
            <span>
              Edit Support: {MODELS[selectedModel].supportsEdit ? "✓" : "✗"}  
            </span>
            <span>
              Default: {MODELS[selectedModel].defaultSize}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}