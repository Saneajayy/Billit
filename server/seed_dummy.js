const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found! Please onboard first.");
    return;
  }
  
  console.log("Seeding data for user:", user.businessName);

  // 1. Customers
  await prisma.customer.create({
    data: {
      userId: user.id,
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '9876543210',
      billingAddress: '123 Tech Park, Bangalore',
      gstin: '29ABCDE1234F1Z5',
      billingState: '29'
    }
  });

  await prisma.customer.create({
    data: {
      userId: user.id,
      name: 'Stark Industries',
      email: 'tony@stark.com',
      phone: '9988776655',
      billingAddress: 'Malibu Point, Mumbai',
      gstin: '27XYZDE1234F1Z5',
      billingState: '27'
    }
  });

  await prisma.customer.create({
    data: {
      userId: user.id,
      name: 'Wayne Enterprises',
      email: 'bruce@wayne.com',
      phone: '9998887776',
      billingAddress: 'Gotham Tower, Delhi',
      gstin: '07DEFGH1234F1Z5',
      billingState: '07'
    }
  });

  // 2. Products
  await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Consulting Services',
      unitPrice: 50000,
      hsnCode: '9983',
      gstRate: 18,
      unit: 'hr'
    }
  });

  await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Server Hardware',
      unitPrice: 150000,
      hsnCode: '8471',
      gstRate: 18,
      unit: 'pcs'
    }
  });

  await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Cloud Storage',
      unitPrice: 12000,
      hsnCode: '9984',
      gstRate: 18,
      unit: 'kg' // Using kg playfully for storage chunk
    }
  });

  await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Software License',
      unitPrice: 25000,
      hsnCode: '9973',
      gstRate: 18,
      unit: 'pcs'
    }
  });

  console.log("Successfully seeded 3 customers and 4 products!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
