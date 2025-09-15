'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, ModelKey, getModelsList } from "@/lib/models/registry";
import ChatPanel from "@/components/Edit/ChatPanel";

function EditPageContent() {
  const searchParams = useSearchParams();
  const {
    selectedModel,
    setSelectedModel,
    addEditReferenceImage,
  } = useSessionStore();
  
  const models = getModelsList().filter(m => m.supportsEdit);

  useEffect(() => {
    // Check for reference image from URL params
    const refImage = searchParams.get('ref');
    if (refImage) {
      addEditReferenceImage(decodeURIComponent(refImage));
    }
  }, [searchParams, addEditReferenceImage]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Models</h1>
          <p className="text-gray-600">Conversational image editing and generation</p>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
          {/* Model Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Select Edit Model</h3>
              
              {/* Model Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Edit-Capable Models ({models.length})
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelKey)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                >
                  {models.map((model) => (
                    <option key={model.key} value={model.key}>
                      {model.name} - ${(model.costPerImage / 100).toFixed(3)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Model Display */}
              {selectedModel && MODELS[selectedModel] && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 text-lg">
                      {MODELS[selectedModel].name}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ${(MODELS[selectedModel].costPerImage / 100).toFixed(3)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {MODELS[selectedModel].description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                      Text-to-Image
                    </span>
                    {MODELS[selectedModel].supportsEdit && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
                        Image Editing
                      </span>
                    )}
                    {MODELS[selectedModel].supportsImageRef && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        Image References
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Default Size: {MODELS[selectedModel].defaultSize}
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-amber-500 text-lg">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800 font-medium">Pro Tip</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Chat history clears on refresh. Conversations are ephemeral by design for privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              {MODELS[selectedModel] && MODELS[selectedModel].supportsEdit ? (
                <ChatPanel />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Model Not Edit-Capable
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The selected model doesn't support image editing features.
                    </p>
                    <p className="text-sm text-gray-500">
                      Please select an edit-capable model from the dropdown to start chatting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPageContent />
    </Suspense>
  );
}