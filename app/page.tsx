import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Sesh Image Gen
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Advanced AI image generation platform with multiple models, editing capabilities, and intelligent prompt enhancement.
          </p>
        </div>
        
        <div className="flex justify-center space-x-6">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/image-gen">
              Start Creating
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/edit">
              Edit Models
            </Link>
          </Button>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Multi-Model Support</h3>
            <p className="text-gray-300">
              Choose from cutting-edge models like Imagen 4 Fast and Nano Banana for different use cases.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Intelligent Prompts</h3>
            <p className="text-gray-300">
              AI-powered prompt enhancement to transform simple ideas into detailed creative instructions.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Advanced Editing</h3>
            <p className="text-gray-300">
              Conversational image editing with reference support and iterative improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}