const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLedgerSystem() {
  try {
    console.log('🏦 Setting up ledger-based wallet system...');

    // Create platform account
    console.log('Creating platform account...');
    let platformAccount = await prisma.walletAccount.findFirst({
      where: { 
        account_type: 'PLATFORM',
        user_id: null 
      }
    });

    if (!platformAccount) {
      platformAccount = await prisma.walletAccount.create({
        data: {
          account_type: 'PLATFORM',
          user_id: null,
          available_cents: 0,
          pending_cents: 0,
          version: 0
        }
      });
    }
    console.log(`✅ Platform account ready: ${platformAccount.id}`);

    // Create wallet accounts for existing users
    const users = await prisma.user.findMany({ select: { id: true } });
    
    for (const user of users) {
      console.log(`Creating wallet for user ${user.id}...`);
      const userAccount = await prisma.walletAccount.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          account_type: 'USER',
          available_cents: 0,
          pending_cents: 0,
          version: 0
        }
      });
      console.log(`✅ Wallet created for user ${user.id}: ${userAccount.id}`);
    }

    console.log('\n🎉 Ledger system setup complete!');
    console.log(`📊 Summary:`);
    console.log(`  - Platform account: ${platformAccount.id}`);
    console.log(`  - User wallets created: ${users.length}`);

  } catch (error) {
    console.error('❌ Error setting up ledger system:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedLedgerSystem();
