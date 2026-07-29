import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../lib/prisma';
import { generateInvoicePDF } from '../services/pdfGenerator';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

export const pdfQueue = new Queue('pdf-generation', { connection });

const pdfWorker = new Worker('pdf-generation', async job => {
  const { invoiceId } = job.data;
  
  console.log(`Processing PDF generation for invoice ${invoiceId}`);
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      user: true,
      customer: true,
      lineItems: { include: { product: true } }
    }
  });

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  // Generate PDF and get local URL
  const pdfUrl = await generateInvoicePDF(invoice);

  // Update Invoice Record
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { pdfUrl }
  });
  
  console.log(`Successfully generated PDF for invoice ${invoiceId}`);

}, { connection });

pdfWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
