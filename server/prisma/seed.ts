import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Demo User
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_2xyzDemoUser123' },
    update: {},
    create: {
      clerkId: 'user_2xyzDemoUser123',
      businessName: 'TechFlow Solutions',
      businessGSTIN: '29AAACA1234A1Z5', // 29 = Karnataka
      businessState: '29',
      businessAddress: '123 Tech Park, Bangalore, Karnataka 560001',
    },
  });

  console.log('Created user:', user.businessName);

  // Create Customers
  // 1 Intra-state customer (Karnataka - 29), 2 Inter-state customers (Maharashtra - 27, Delhi - 07)
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        userId: user.id,
        name: 'Local Retailers',
        gstin: '29BBBCB1234B1Z5',
        email: 'contact@localretailers.in',
        phone: '9876543210',
        billingState: '29',
        billingAddress: '456 MG Road, Bangalore',
      },
    }),
    prisma.customer.create({
      data: {
        userId: user.id,
        name: 'Mumbai Traders',
        gstin: '27CCCCD1234C1Z5',
        email: 'info@mumbaitraders.in',
        phone: '9876543211',
        billingState: '27',
        billingAddress: '789 Nariman Point, Mumbai',
      },
    }),
    prisma.customer.create({
      data: {
        userId: user.id,
        name: 'Delhi Distributors',
        gstin: '07DDDDE1234D1Z5',
        email: 'sales@delhidist.in',
        phone: '9876543212',
        billingState: '07',
        billingAddress: '101 Connaught Place, New Delhi',
      },
    }),
  ]);

  console.log('Created customers:', customers.length);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'Web Development Services',
        hsnCode: '998314',
        unitPrice: 50000,
        gstRate: 18,
        unit: 'project',
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'SEO Audit',
        hsnCode: '998314',
        unitPrice: 15000,
        gstRate: 18,
        unit: 'report',
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        name: 'Cloud Hosting (Monthly)',
        hsnCode: '998315',
        unitPrice: 5000,
        gstRate: 18,
        unit: 'month',
      },
    }),
  ]);

  console.log('Created products:', products.length);

  // Create Invoices
  // Intra-state invoice
  const intraInvoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customers[0].id,
      invoiceNumber: 'INV-2026-0001',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      isInterState: false,
      subtotal: 50000,
      totalCGST: 4500,
      totalSGST: 4500,
      totalIGST: 0,
      grandTotal: 59000,
      status: 'ISSUED',
      lineItems: {
        create: [
          {
            productId: products[0].id,
            description: 'E-commerce Website Development',
            quantity: 1,
            unitPrice: 50000,
            gstRate: 18,
            taxableValue: 50000,
            cgstAmount: 4500,
            sgstAmount: 4500,
            igstAmount: 0,
            lineTotal: 59000,
          },
        ],
      },
    },
  });

  // Inter-state invoice
  const interInvoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: customers[1].id,
      invoiceNumber: 'INV-2026-0002',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isInterState: true,
      subtotal: 15000,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 2700,
      grandTotal: 17700,
      status: 'DRAFT',
      lineItems: {
        create: [
          {
            productId: products[1].id,
            description: 'Comprehensive SEO Audit',
            quantity: 1,
            unitPrice: 15000,
            gstRate: 18,
            taxableValue: 15000,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 2700,
            lineTotal: 17700,
          },
        ],
      },
    },
  });

  console.log('Created invoices: 2');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
