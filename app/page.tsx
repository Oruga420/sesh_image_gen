import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sesh-purple via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-sesh-purple/20 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-poppins font-bold mb-6 bg-gradient-to-r from-sesh-teal to-sesh-yellow bg-clip-text text-transparent">
            Sesh Image Gen
          </h1>
          <p className="text-xl text-gray-200 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced AI image generation platform with multiple models, editing capabilities, and intelligent prompt enhancement.
          </p>
        </div>
        
        <div className="flex justify-center space-x-6">
          <Button asChild variant="sesh" size="lg" className="text-lg px-8 font-poppins">
            <Link href="/image-gen">
              Start Creating
            </Link>
          </Button>
          
          <Button asChild variant="seshOutline" size="lg" className="text-lg px-8 font-poppins">
            <Link href="/edit">
              Edit Models
            </Link>
          </Button>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-sesh-teal/20 to-sesh-purple/20 dark:from-sesh-teal/10 dark:to-sesh-purple/10 backdrop-blur rounded-lg p-6 border border-sesh-teal/30 dark:border-sesh-teal/20 shadow-sesh">
            <h3 className="text-xl font-poppins font-semibold mb-3 text-sesh-yellow">Multi-Model Support</h3>
            <p className="text-gray-200 dark:text-gray-300">
              Choose from cutting-edge models like Imagen 4 Fast and Nano Banana for different use cases.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-sesh-purple/20 to-sesh-coral/20 dark:from-sesh-purple/10 dark:to-sesh-coral/10 backdrop-blur rounded-lg p-6 border border-sesh-purple/30 dark:border-sesh-purple/20 shadow-sesh">
            <h3 className="text-xl font-poppins font-semibold mb-3 text-sesh-yellow">Intelligent Prompts</h3>
            <p className="text-gray-200 dark:text-gray-300">
              AI-powered prompt enhancement to transform simple ideas into detailed creative instructions.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-sesh-coral/20 to-sesh-teal/20 dark:from-sesh-coral/10 dark:to-sesh-teal/10 backdrop-blur rounded-lg p-6 border border-sesh-coral/30 dark:border-sesh-coral/20 shadow-sesh">
            <h3 className="text-xl font-poppins font-semibold mb-3 text-sesh-yellow">Advanced Editing</h3>
            <p className="text-gray-200 dark:text-gray-300">
              Conversational image editing with reference support and iterative improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}