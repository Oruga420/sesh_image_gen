import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sesh-purple via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-sesh-purple/20 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold mb-4 sm:mb-6 bg-gradient-to-r from-sesh-teal to-sesh-yellow bg-clip-text text-transparent">
            Sesh Image Gen
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Advanced AI image generation platform with multiple models, editing capabilities, and intelligent prompt enhancement.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:space-x-6 sm:gap-0">
          <Button asChild variant="sesh" size="lg" className="text-base sm:text-lg px-6 sm:px-8 font-poppins w-full sm:w-auto">
            <Link href="/image-gen">
              Start Creating
            </Link>
          </Button>
          
          <Button asChild variant="seshOutline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 font-poppins w-full sm:w-auto">
            <Link href="/edit">
              Edit Models
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-gradient-to-br from-sesh-teal/20 to-sesh-purple/20 dark:from-sesh-teal/10 dark:to-sesh-purple/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-sesh-teal/30 dark:border-sesh-teal/20 shadow-sesh">
            <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2 sm:mb-3 text-sesh-yellow">Multi-Model Support</h3>
            <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
              Choose from cutting-edge models like Imagen 4 Fast and Nano Banana for different use cases.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-sesh-purple/20 to-sesh-coral/20 dark:from-sesh-purple/10 dark:to-sesh-coral/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-sesh-purple/30 dark:border-sesh-purple/20 shadow-sesh">
            <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2 sm:mb-3 text-sesh-yellow">Intelligent Prompts</h3>
            <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
              AI-powered prompt enhancement to transform simple ideas into detailed creative instructions.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-sesh-coral/20 to-sesh-teal/20 dark:from-sesh-coral/10 dark:to-sesh-teal/10 backdrop-blur rounded-lg p-4 sm:p-6 border border-sesh-coral/30 dark:border-sesh-coral/20 shadow-sesh sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-poppins font-semibold mb-2 sm:mb-3 text-sesh-yellow">Advanced Editing</h3>
            <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
              Conversational image editing with reference support and iterative improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}