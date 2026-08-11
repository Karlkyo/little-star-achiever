# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Little Star Achiever** is a gamified positive behavior reinforcement app for young children (ages 3-5), built with React, TypeScript, Vite, and Capacitor for Android deployment. The app uses Google Gemini AI for:
- AI-generated parenting suggestions (tasks, rewards, calm-down activities)
- Text-to-speech encouragement in Simplified Chinese when children complete tasks

The UI is in **Simplified Chinese** and designed for touch interaction by young children.

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Set GEMINI_API_KEY in .env.local before running
# Run dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Type-check and build
npm run check

# Preview production build
npm run preview
```

### Capacitor (Android)
```bash
# Sync web assets to Android project
npx cap sync

# Open Android Studio
npx cap open android

# Build and sync in one step
npm run build && npx cap sync

# Build release APK from Android Studio:
# Build > Generate Signed Bundle/APK
```

**Important**: Always run `npm run build && npx cap sync` before testing on Android to ensure latest web changes are included.

## Architecture

### Core Data Flow
1. **App.tsx**: Main application container
   - Manages global state (stars, tasks, rewards, settings, calm activities)
   - Persists all state to `localStorage`
   - Handles tab navigation (Tasks/Rewards/Stats/Parent Zone)
   - Task completion triggers star animation and optional AI voice encouragement

2. **State Management**: React state with the custom `useLocalStorage` hooks
   - No external state library
   - Each data type (tasks, rewards, settings, etc.) has its own state and localStorage key

3. **AI Integration** (`services/geminiService.ts`):
   - **Text Generation**: Uses `gemini-3-flash-preview` model with JSON output for suggesting tasks/rewards/calm activities
   - **TTS**: Uses `gemini-2.5-flash-preview-tts` model with 'Kore' voice preset for Simplified Chinese audio
   - **Audio Playback**: Base64 PCM audio decoded to Web Audio API `AudioBuffer` (24kHz, mono, int16)
   - Audio context must be initialized on user interaction (handled in `handleTaskComplete`)

### Component Structure

- **App.tsx**: Main container, tab navigation, star jar, task/reward rendering
- **components/StarJar.tsx**: Visual star counter (animated glass jar)
- **components/ParentZone.tsx**: Parent settings, AI assistant interface (3 modes: Task/Reward/Calm)
- **components/CalmDownCorner.tsx**: Full-screen overlay with breathing exercises for emotional regulation
- **components/StatsPanel.tsx**: Completion statistics and achievement wall
- **components/Modal.tsx**: Accessible confirmation and alert dialogs

### Type Definitions (`types.ts`)

- **Task**: `{ id, title, emoji, stars, category: 'daily' | 'behavior' | 'learning' }`
- **Reward**: `{ id, title, emoji, cost, type: 'material' | 'experience' | 'affection' | 'privilege' }`
- **CalmDownActivity**: `{ id, title, emoji, description }`
- **UserSettings**: `{ childName: string, voiceEnabled: boolean }`

### Default Data (`constants.ts`)

Contains Chinese-language defaults for tasks, rewards, and calm-down activities across several categories.
- `TOTAL_STARS_CAPACITY = 30` (visual cap for jar animation)

## Important Configuration

### Environment Variables
- **GEMINI_API_KEY**: Required in `.env.local` for AI features
- Vite config injects this as `process.env.API_KEY` and `process.env.GEMINI_API_KEY`
- The key is bundled into client builds; use a backend proxy before any public deployment

### Vite Configuration
- Dev server runs on port 3000, host `0.0.0.0`
- Path alias: `@/` maps to project root
- Loads `.env.local` for API keys

### Capacitor Configuration
- **App ID**: `com.littlestar.app`
- **App Name**: `Little Star Achiever`
- **Web Directory**: `dist` (Vite build output)

## Key Development Patterns

1. **Adding New Features to App State**:
   - Add state with the appropriate `useLocalStorage` hook
   - Update relevant render functions

2. **Working with Gemini AI**:
   - All AI calls are in `services/geminiService.ts`
   - Text generation returns JSON strings (must parse and clean markdown code blocks)
   - TTS requires audio context initialization on user interaction

3. **Styling**:
   - Uses Tailwind CSS through the local PostCSS build
   - Custom animations and accessibility fallbacks are defined in `index.css`
   - Font: locally bundled Fredoka via `@fontsource/fredoka`
   - Color scheme: Warm yellows, purples, pinks for child-friendly UI

4. **Audio Context Management**:
   - Must call `ensureAudioContextReady()` in click handlers before TTS
   - Audio may not work until user interacts with page (browser security)

## Testing Notes

- **Voice Testing**: Use "测试语音" button in Parent Zone settings
- **Local Storage**: Clear localStorage to reset app to defaults
- **Android Testing**: Use Android Studio emulator or physical device via USB debugging
- **API Key**: Ensure valid Gemini API key is set in `.env.local`
