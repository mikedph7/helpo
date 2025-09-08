import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a new instance for each serverless function in production
// to avoid prepared statement conflicts
export const prisma = process.env.NODE_ENV === 'production' 
  ? new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  : globalForPrisma.prisma ?? new PrismaClient({
      log: ['query', 'error', 'warn'],
    })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
