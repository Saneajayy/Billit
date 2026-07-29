import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { authErrorHandler } from './middleware/auth';
import v1Routes from './routes/v1';

console.log("=== SERVER STARTUP ===");
console.log("REDIS_URL:", process.env.REDIS_URL);
console.log("======================");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static PDFs
app.use('/pdfs', express.static(path.join(__dirname, '../../.volumes/pdfs')));

// Routes will be added here
app.use('/api/v1', v1Routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(authErrorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
