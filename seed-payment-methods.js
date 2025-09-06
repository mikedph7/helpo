const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPaymentMethods() {
  try {
    console.log('🏦 Seeding payment methods...');

    // Clear existing payment methods
    await prisma.paymentMethod.deleteMany({});

    const paymentMethods = [
      {
        method_type: 'gcash',
        name: 'GCash',
        account_number: '+639171234567',
        account_name: 'Helpo Services',
        qr_code_url: '/images/payment/gcash-qr.png',
        instructions: 'Send payment to the GCash number above or scan the QR code. After payment, take a screenshot of the confirmation and upload it as proof of payment.',
        is_active: true
      },
      {
        method_type: 'bank_transfer',
        name: 'BPI',
        account_number: '1234-5678-90',
        account_name: 'Helpo Services Inc.',
        instructions: 'Transfer payment to the BPI account above via online banking, ATM, or over-the-counter. Use your booking ID as reference. After payment, take a screenshot of the confirmation and upload it as proof of payment.',
        is_active: true
      },
      {
        method_type: 'bank_transfer',
        name: 'BDO',
        account_number: '9876-5432-10',
        account_name: 'Helpo Services Inc.',
        instructions: 'Transfer payment to the BDO account above via online banking, ATM, or over-the-counter. Use your booking ID as reference. After payment, take a screenshot of the confirmation and upload it as proof of payment.',
        is_active: true
      },
      {
        method_type: 'bank_transfer',
        name: 'Metrobank',
        account_number: '5555-4444-33',
        account_name: 'Helpo Services Inc.',
        instructions: 'Transfer payment to the Metrobank account above via online banking, ATM, or over-the-counter. Use your booking ID as reference. After payment, take a screenshot of the confirmation and upload it as proof of payment.',
        is_active: true
      }
    ];

    for (const method of paymentMethods) {
      await prisma.paymentMethod.create({ data: method });
      console.log(`✅ Created ${method.name} payment method`);
    }

    console.log('🎉 Payment methods seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPaymentMethods();
