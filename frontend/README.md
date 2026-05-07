# Taskify Frontend

Frontend application for the Taskify platform.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your API base URL and WebSocket URL
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## Technologies

- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- Zustand for state management
- Socket.IO for real-time updates
- Tailwind CSS for styling
- dnd-kit for drag and drop
