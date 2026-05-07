# Taskify Backend

Backend API for the Taskify application.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

3. Set up the database:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run build` - Build the project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## API Documentation

See the contracts in `/specs/001-create-taskify/contracts/` for API details.
