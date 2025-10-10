'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, getModelsList } from "@/lib/models";
import { Button } from "@/components/ui/button";
import ChatPanel from "@/components/Edit/ChatPanel";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Models</h1>
            <p className="text-gray-600">Conversational image editing and generation</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
          {/* Model Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-4">Edit-Capable Models</h3>

              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.key}
                    onClick={() => setSelectedModel(model.key)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedModel === model.key
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      ${(model.costPerImage / 100).toFixed(3)} per image
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {model.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Chat history is cleared on page reload.
                  All conversations are ephemeral by design.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              {MODELS[selectedModel].supportsEdit ? (
                <ChatPanel />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <p className="text-lg">This model doesn't support editing</p>
                    <p className="text-sm">Please select an edit-capable model</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EditPageContent />
    </Suspense>
  );
}
