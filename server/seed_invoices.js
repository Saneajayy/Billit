const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found!");
    return;
  }

  const customers = await prisma.customer.findMany({ where: { userId: user.id } });
  const products = await prisma.product.findMany({ where: { userId: user.id } });

  if (customers.length === 0 || products.length === 0) {
    console.log("Please seed customers and products first!");
    return;
  }

  console.log(`Creating invoices for user: ${user.businessName}`);

  const userState = user.businessState;

  for (let i = 1; i <= 3; i++) {
    const customer = customers[i % customers.length];
    const isInterState = userState !== customer.billingState;
    
    // Pick a couple of products
    const p1 = products[0];
    const p2 = products[1];

    const q1 = i * 2;
    const q2 = i * 1;

    // Item 1
    const t1 = p1.unitPrice * q1;
    let cgst1 = 0, sgst1 = 0, igst1 = 0;
    if (isInterState) {
      igst1 = (t1 * p1.gstRate) / 100;
    } else {
      cgst1 = (t1 * (p1.gstRate / 2)) / 100;
      sgst1 = (t1 * (p1.gstRate / 2)) / 100;
    }
    const total1 = t1 + cgst1 + sgst1 + igst1;

    // Item 2
    const t2 = p2.unitPrice * q2;
    let cgst2 = 0, sgst2 = 0, igst2 = 0;
    if (isInterState) {
      igst2 = (t2 * p2.gstRate) / 100;
    } else {
      cgst2 = (t2 * (p2.gstRate / 2)) / 100;
      sgst2 = (t2 * (p2.gstRate / 2)) / 100;
    }
    const total2 = t2 + cgst2 + sgst2 + igst2;

    const subtotal = t1 + t2;
    const totalCGST = cgst1 + cgst2;
    const totalSGST = sgst1 + sgst2;
    const totalIGST = igst1 + igst2;
    const grandTotal = total1 + total2;

    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - i * 5); // Spread them over past days

    await prisma.invoice.create({
      data: {
        userId: user.id,
        customerId: customer.id,
        invoiceNumber: `INV-2026-000${i}`,
        invoiceDate,
        dueDate: new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days later
        isInterState,
        subtotal,
        totalCGST,
        totalSGST,
        totalIGST,
        grandTotal,
        status: i === 1 ? 'PAID' : 'ISSUED',
        lineItems: {
          create: [
            {
              productId: p1.id,
              description: p1.name,
              quantity: q1,
              unitPrice: p1.unitPrice,
              gstRate: p1.gstRate,
              taxableValue: t1,
              cgstAmount: cgst1,
              sgstAmount: sgst1,
              igstAmount: igst1,
              lineTotal: total1
            },
            {
              productId: p2.id,
              description: p2.name,
              quantity: q2,
              unitPrice: p2.unitPrice,
              gstRate: p2.gstRate,
              taxableValue: t2,
              cgstAmount: cgst2,
              sgstAmount: sgst2,
              igstAmount: igst2,
              lineTotal: total2
            }
          ]
        }
      }
    });
    console.log(`Created INV-2026-000${i}`);
  }

  console.log("Successfully seeded 3 dummy invoices!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
