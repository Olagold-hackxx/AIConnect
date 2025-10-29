# AIConnect Chatbot Setup

## Overview
The AIConnect landing page now includes an AI-powered chatbot that uses Google's Gemini model to provide intelligent responses about the AIConnect platform.

## Setup Instructions

### 1. Get Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables
1. Create a `.env.local` file in the frontend directory
2. Add your API key:
```bash
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### 3. Start the Development Server
```bash
npm run dev
```

## Features

### AI-Powered Responses
- Uses Google Gemini 1.5 Flash model
- Comprehensive knowledge base about AIConnect
- Contextual responses based on conversation history
- Professional and helpful tone

### Knowledge Base
The chatbot has access to detailed information about:
- AIConnect platform overview and value proposition
- 10+ specialized AI personas (Digital Marketer, Legal Assistant, etc.)
- Technical specifications and integration methods
- Pricing tiers (Free, Pro, Enterprise)
- Security and compliance features
- Use cases and success stories
- Getting started instructions

### UI Features
- Floating chat button with animated gradient ring
- Expandable chat window with modern design
- Real-time typing indicators
- Message history with user/assistant avatars
- Responsive design that works on all devices

## Technical Implementation

### Frontend
- Uses Vercel's `ai` package with `useChat` hook
- React component with TypeScript
- Tailwind CSS for styling
- Real-time streaming responses

### Backend
- Next.js API route (`/api/chat`)
- Google Generative AI SDK
- Comprehensive system prompt with knowledge base
- Error handling and fallback responses

## Customization

### Adding New Knowledge
Update the knowledge base in `lib/knowledge-base.ts` to add new information about AIConnect.

### Modifying AI Behavior
Edit the system prompt in `app/api/chat/route.ts` to change how the AI responds.

### Styling Changes
Modify the component styles in `components/landing/chatbot-widget.tsx`.

## Testing

1. Open the landing page
2. Click the floating chat button (bottom right)
3. Ask questions about AIConnect:
   - "What is AIConnect?"
   - "What AI personas do you offer?"
   - "What are your pricing plans?"
   - "How do I get started?"

The chatbot should provide detailed, accurate responses based on the knowledge base.


