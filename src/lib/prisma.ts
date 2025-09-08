import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For production: create fresh instances with disabled prepared statements
// to avoid conflicts in serverless + connection pooling environment
export const prisma = process.env.NODE_ENV === 'production' 
  ? new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '&prepared_statements=false'
        }
      }
    })
  : globalForPrisma.prisma ?? new PrismaClient({
      log: ['query', 'error', 'warn'],
    })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
