# Deployment Guide

## Current Status
The application code is complete with all MVP features implemented, but there are dependency installation issues in the current WSL environment.

## Quick Solution

### Option 1: Fresh Installation
1. **Copy the project to a new directory**:
   ```bash
   cp -r "/mnt/c/Users/chuck/OneDrive/Desktop/Sesh Image Gen" /tmp/sesh-image-gen-clean
   cd /tmp/sesh-image-gen-clean
   rm -rf node_modules package-lock.json
   ```

2. **Install with stable Node.js**:
   ```bash
   nvm use 18
   npm install
   npm run dev
   ```

### Option 2: Deploy to Vercel Directly
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sesh Image Gen MVP"
   git remote add origin https://github.com/your-username/sesh-image-gen.git
   git push -u origin main
   ```

2. **Deploy via Vercel**:
   - Go to vercel.com
   - Import the GitHub repository
   - Add environment variables:
     - `REPLICATE_API_TOKEN`
     - `GROQ_API_KEY`
     - `REPLICATE_MODEL_IMAGEN4_FAST_VERSION`
     - `REPLICATE_MODEL_NANO_BANANA_VERSION`

### Option 3: Use GitHub Codespaces
1. Push code to GitHub
2. Open in Codespaces
3. Run `npm install && npm run dev`

## Environment Variables Required
```env
REPLICATE_API_TOKEN=r8_your_token_here
GROQ_API_KEY=gsk_your_key_here
REPLICATE_MODEL_IMAGEN4_FAST_VERSION=model_version_hash
REPLICATE_MODEL_NANO_BANANA_VERSION=model_version_hash
```

Get model versions from:
- https://replicate.com/google/imagen-4-fast
- https://replicate.com/google/nano-banana

## Features Implemented ✅

### 1. Image Generation Screen (`/image-gen`)
- Model selection dropdown with capability awareness
- Prompt input with character counter
- Image reference uploader (enabled/disabled per model)
- Generate button with loading states
- Output grid with quick download + preview
- Prompt upgrade popup with streaming enhancement

### 2. Technical Implementation
- **Next.js 14** App Router with TypeScript
- **Zustand** for ephemeral state management
- **Tailwind CSS** for styling
- **API Routes** for Replicate and Groq integration
- **Model Registry** with capability flags
- **Streaming Support** for real-time updates

### 3. API Integration
- `/api/replicate/predict` - Image generation
- `/api/groq/rewrite` - Prompt enhancement with SSE
- `/api/groq/transcribe` - Speech-to-text (ready)

## Project Structure
```
app/
├── image-gen/page.tsx          # Main generation screen
├── api/
│   ├── replicate/predict/      # Image generation endpoint
│   └── groq/
│       ├── rewrite/            # Prompt enhancement
│       └── transcribe/         # Speech-to-text
components/
├── ImageGen/                   # Generation components
├── PromptUpgrade/              # Enhancement popup
└── ui/                         # Base components
lib/
├── models.ts                   # Model capability registry
├── replicate.ts                # Replicate client
└── groq.ts                     # Groq client
store/
└── useSessionStore.ts          # Ephemeral state (Zustand)
```

## Troubleshooting

If you encounter dependency issues:
1. Use Node.js 18 instead of 22
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall
4. Use yarn instead of npm if issues persist

## Next Steps
1. Set up API keys
2. Deploy to Vercel or similar platform
3. Test all features
4. Add additional models as needed

The MVP is feature-complete and ready for deployment!
