# Billit - Invoice & GST Billing Manager

Billit is a full-stack, on-premise style ERP/billing tool designed for Indian businesses to manage customers, products, generate GST-compliant invoices, track revenue, and leverage AI to query business data.

## Features

- **GST Calculation Core**: Auto-determines Intra-state (CGST + SGST) vs Inter-state (IGST) taxation based on the business's home state and the customer's billing state.
- **Invoice Generation**: Full invoice lifecycle with real-time tax breakdown on the frontend and server-validated recalculation.
- **Background PDF Generation**: Utilizes BullMQ and Redis to offload heavy PDF generation (via `pdfkit`) to a background worker, storing the generated files locally.
- **Caching**: Dashboard metrics are aggregated and cached in Redis for fast retrieval, with cache invalidation upon new invoice creation.
- **AI Assistant**: Integrates with Google Gemini to allow natural language querying of recent invoice and revenue data, carefully scoped to avoid arbitrary SQL injection.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, BullMQ.
- **Database / Cache**: PostgreSQL, Redis.
- **Auth**: Clerk.

## Setup Instructions

### Prerequisites
- Node.js v20+
- Docker and docker-compose
- A Clerk Account (for auth)
- A Google Gemini API Key

### 1. Environment Variables
Copy the `.env.example` to `.env` in both the `client` and `server` directories and fill in the required keys.

```bash
# In client/
cp .env.example .env

# In server/
cp .env.example .env
```

### 2. Start Infrastructure
Start the PostgreSQL and Redis containers:
```bash
docker-compose up -d postgres redis
```

### 3. Setup Database
Initialize the Prisma schema and seed the database with demo data:
```bash
cd server
npm install
npx prisma db push
npx prisma db seed
```

### 4. Run the Application
In separate terminals, run the client and server:

**Server**:
```bash
cd server
npm run dev
```
*Note: This will also start the BullMQ worker in the background for PDF generation.*

**Client**:
```bash
cd client
npm run dev
```

## Architecture & Design Decisions

### GST Logic
The GST calculation is built as a pure, unit-testable function (`gstCalculator.ts`). It takes the home state, billing state, and line items, determining `isInterState` and splitting taxes accordingly. Crucially, the frontend calculates this in real-time for UI responsiveness, but the backend **recomputes and strictly enforces** these calculations within a Prisma `$transaction` before saving.

### AI Assistant Approach
Instead of allowing the LLM to generate raw SQL or query the database freely (which poses severe security and scoping risks in a multi-tenant or sensitive financial system), we implemented a **Scoped Context Injection** approach. The backend fetches a relevant, bounded slice of the business's data (e.g., last 30 invoices, aggregations), formats it as a JSON context, and provides it to Gemini. This guarantees the LLM only reasons over explicitly permitted data.

### Background Queue Processing
Generating PDFs on the main Express request thread can block the event loop and lead to timeouts for large invoices or under load. We offload PDF creation to a BullMQ worker (`pdfQueue.ts`) backed by Redis. This allows the API to respond instantly (201 Created) while the document is rendered asynchronously.
