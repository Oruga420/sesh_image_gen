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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Models</h1>
          <p className="text-gray-600 dark:text-gray-300">Conversational image editing and generation</p>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
          {/* Model Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-fit border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Edit Model</h3>
              
              {/* Model Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Edit-Capable Models ({models.length})
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelKey)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sesh-teal focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-sm"
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
                <div className="bg-gradient-to-br from-sesh-teal/10 to-sesh-purple/10 dark:from-sesh-teal/5 dark:to-sesh-purple/5 rounded-lg p-4 border border-sesh-teal/30 dark:border-sesh-teal/20">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                      {MODELS[selectedModel].name}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      ${(MODELS[selectedModel].costPerImage / 100).toFixed(3)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {MODELS[selectedModel].description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-sesh-teal/10 dark:bg-sesh-teal/20 text-sesh-teal dark:text-sesh-teal">
                      <span className="w-2 h-2 bg-sesh-teal rounded-full mr-1.5"></span>
                      Text-to-Image
                    </span>
                    {MODELS[selectedModel].supportsEdit && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-sesh-purple/10 dark:bg-sesh-purple/20 text-sesh-purple dark:text-sesh-purple">
                        <span className="w-2 h-2 bg-sesh-purple rounded-full mr-1.5"></span>
                        Image Editing
                      </span>
                    )}
                    {MODELS[selectedModel].supportsImageRef && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        Image References
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Default Size: {MODELS[selectedModel].defaultSize}
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-sesh-yellow/10 dark:bg-sesh-yellow/5 rounded-lg border border-sesh-yellow/30 dark:border-sesh-yellow/20">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-sesh-yellow text-lg">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-sesh-purple dark:text-sesh-yellow font-medium">Pro Tip</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                      Chat history clears on refresh. Conversations are ephemeral by design for privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col border border-gray-200 dark:border-gray-700">
              {MODELS[selectedModel] && MODELS[selectedModel].supportsEdit ? (
                <ChatPanel />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Model Not Edit-Capable
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      The selected model doesn't support image editing features.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
    <Suspense fallback={
      <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    }>
      <EditPageContent />
    </Suspense>
  );
}