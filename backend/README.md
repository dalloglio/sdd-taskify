# Taskify Backend

Backend API for the Taskify application.

## Setup

### Docker Compose

From the repository root, run the full local stack:

```bash
docker compose up --build
```

This starts PostgreSQL, the backend API on `http://localhost:3000`, and the frontend on `http://localhost:5173`.

For a fresh database volume, seed the demo workspace from another terminal after the backend is healthy:

```bash
docker compose exec backend npx prisma db seed
```

### Local npm

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

See `docs/api.md` for implemented endpoint details.
