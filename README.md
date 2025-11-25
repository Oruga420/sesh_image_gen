# Sesh Image Gen

Advanced AI image generation platform with multiple models, reference support, and intelligent prompt enhancement.

## Features

### 🎨 Image Generation
- **Multi-Model Support**: Choose from Imagen 4 Fast and Nano Banana
- **Model-Aware UI**: Upload buttons automatically enabled/disabled based on model capabilities  
- **Reference Image Support**: Upload reference images for supported models
- **Real-time Generation**: Stream-enabled predictions with live updates

### ✨ Prompt Enhancement
- **AI-Powered Upgrades**: Transform simple prompts into detailed creative instructions
- **Multiple Modes**: Enhance, Creative, and Detailed enhancement options
- **Live Streaming**: Watch your prompt being enhanced in real-time
- **Groq Integration**: Fast prompt rewriting using OpenAI-compatible API

### 🖼️ Reference-Friendly Workflow
- **Bring Your Own Images**: Feed supporting visuals into models that accept references
- **Reusable Outputs**: Quickly download and reuse any generation as a future reference
- **One-Click Copy**: Grab shareable URLs directly from the preview modal

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: React, Tailwind CSS, Custom Components
- **State**: Zustand (ephemeral, resets on reload)
- **APIs**: Replicate (image generation), Groq (prompt enhancement & transcription)
- **Deployment**: Optimized for Vercel

## Setup

### 1. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
# Replicate
REPLICATE_API_TOKEN=r8_your_token_here

# Groq  
GROQ_API_KEY=gsk_your_key_here

# Model versions (get from Replicate model pages)
REPLICATE_MODEL_IMAGEN4_FAST_VERSION=model_version_hash
REPLICATE_MODEL_NANO_BANANA_VERSION=model_version_hash
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## Model Configuration

The app uses a capability registry system in `lib/models.ts`:

```typescript
export const MODELS: Record<ModelKey, {
  replicateModelPath: string;   // Replicate model path
  versionEnv: string;           // Environment variable name
  supportsImageRef: boolean;    // Enable/disable uploader  
  defaultSize: string;          // UI preset
  name: string;                 // Display name
  description: string;          // Description
  costPerImage: number;         // Cost in cents
}> = {
  // Model definitions...
}
```

## API Endpoints

### `/api/replicate/predict`
- **Method**: POST
- **Purpose**: Create image generation predictions
- **Body**: `{ modelKey: string, input: Record<string, any> }`
- **Returns**: `{ id, status, streamUrl, webUrl }`

### `/api/groq/rewrite` 
- **Method**: POST
- **Purpose**: Enhance prompts using AI
- **Body**: `{ rawPrompt: string, mode: string }`
- **Returns**: Server-sent events (SSE) stream

### `/api/groq/transcribe`
- **Method**: POST  
- **Purpose**: Speech-to-text transcription
- **Body**: FormData with audio file
- **Returns**: `{ text: string, raw: object }`

## Architecture Decisions

### State Management (Zustand)
- **Ephemeral by Design**: All state resets on page reload per requirements
- **Centralized Store**: Single store for all app state
- **Type Safety**: Full TypeScript integration

### Model Registry
- **Single Source of Truth**: All model capabilities defined in one place
- **UI-Driven**: Capabilities automatically control UI behavior
- **Extensible**: Easy to add new models

### API Design
- **Server-Side Only**: API keys never exposed to client
- **Streaming Support**: Real-time updates via SSE and EventSource
- **Error Handling**: Comprehensive error handling and user feedback

## Deployment (Vercel)

### 1. Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### 2. Environment Variables
Add all environment variables in Vercel dashboard:
- `REPLICATE_API_TOKEN`
- `GROQ_API_KEY` 
- Model version environment variables

### 3. Domain Configuration
Configure custom domain if needed in Vercel dashboard.

## Development Notes

### Adding New Models
1. Add model definition to `lib/models.ts`
2. Add environment variable for version
3. Update API routes if special input handling needed
4. Test capabilities (image refs, prompt upgrade)

### Prompt Enhancement Modes
- **enhance**: Improve clarity and detail
- **creative**: Add creative flourishes  
- **detailed**: Maximize descriptive detail

Current implementation uses OpenAI-compatible Groq models for fast, cost-effective prompt enhancement.

### Image Reference Handling
- Files converted to data URLs for small images (< 256KB)
- Larger files should use Replicate Files API (not implemented in MVP)
- Model registry controls when upload UI is shown

## Security Considerations

- API keys stored server-side only
- File upload size limits enforced
- No persistent storage of images or conversations
- Input validation on all API endpoints

## Performance Optimizations

- Next.js Image component for optimized loading
- Remote patterns configured for Replicate CDN
- SSE streaming for real-time updates
- Component lazy loading where appropriate

## Future Enhancements

- [ ] Persistent conversation history (with user accounts)
- [ ] Batch image generation
- [ ] Advanced model parameters (aspect ratio, quality, etc.)
- [ ] Image-to-image transformations
- [ ] Voice input for prompts (Whisper integration ready)
- [ ] Model comparison mode
- [ ] Generation history and favorites
